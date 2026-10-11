#!/usr/bin/env python3
"""myhomepage をローカル向けにサーブする。

標準ライブラリのみで実装。systemd サービスから
`python3 serve.py` として起動される前提。

設定は環境変数で上書きできる:
    SERVE_HOST  待ち受けアドレス (既定 127.0.0.1)
    SERVE_PORT  ポート番号       (既定 8080)
"""

from __future__ import annotations

import functools
import http.server
import logging
import os
import signal
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

HOST = os.environ.get("SERVE_HOST", "127.0.0.1")
PORT = int(os.environ.get("SERVE_PORT", "8080"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-7s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("myhomepage")


class Handler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler をディレクトリ固定・Quiet化で拡張。"""

    server_version = "myhomepage"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        # 既定の実装は stderr に直接書くため、logging に統一する。
        log.info("%s - %s", self.address_string(), fmt % args)

    def end_headers(self) -> None:
        # 開発中に編集内容を即反映させるため、キャッシュさせない。
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address) -> None:
        # 接続リセット等は無視してサービスを落とさない。
        exc = sys.exc_info()[1]
        if isinstance(exc, (ConnectionResetError, BrokenPipeError)):
            log.info("接続が切断されました: %s", client_address)
            return
        log.exception("リクエスト処理中にエラー: %s", client_address)


def main() -> int:
    if not ROOT.is_dir():  # pragma: no cover - 起動前提のチェック
        log.error("サーブ対象が見つかりません: %s", ROOT)
        return 1

    handler = functools.partial(Handler)

    try:
        httpd = Server((HOST, PORT), handler)
    except OSError as exc:
        log.error("ポート %d をバインドできません: %s", PORT, exc)
        return 1

    def shutdown(signum, _frame):
        log.info("シグナル %s を受信、停止します", signal.Signals(signum).name)
        # serve_forever() を別スレッドから中断させてクリーンに終了させる。
        import threading

        threading.Thread(target=httpd.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    log.info("myhomepage をサーブします: http://%s:%d/ (root=%s)", HOST, PORT, ROOT)
    try:
        httpd.serve_forever()
    finally:
        httpd.server_close()
        log.info("停止しました")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())