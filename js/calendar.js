function calendar() {
    const now = new Date();

    const month = String(now.getMonth() + 1);
    const date = String(now.getDate());

    const dayCode = now.getDay();
    const dayText = parseDayCode(dayCode);

    document.getElementById("calendar").textContent =`${month}月${date}日--${dayText}曜日--`
}

function parseDayCode(code) {
    switch (code) {
        case 0:
            return "日";
        case 1:
            return "月";
        case 2:
            return "火";
        case 3:
            return "水";
        case 4:
            return "木";
        case 5:
            return "金";
        case 6:
            return "土";
    }
}

calendar();
