# Meta Campaign Agent

סוכן CLI שמשמש כמנהל מדיה (Media Buyer) אישי לקמפיינים במטא (Facebook/Instagram Ads).
אתה מדבר איתו בצ'אט, הוא קורא נתונים אמיתיים מ-Meta Marketing API, מנתח אותם בסטייל
ישיר וממוקד-מספרים (Alex Hormozi), ויכול גם לבצע פעולות בפועל: יצירת קמפיינים/אדסטים/קריאייטיבים/מודעות,
שינוי תקציבים, והשהיה/הפעלה.

## דרישות מוקדמות

- Node.js 18+
- Anthropic API key
- Meta Marketing API access: access token (System User / long-lived) עם הרשאות `ads_management`, `ads_read`, ו-Ad Account ID (`act_...`)

## הרצה

```bash
cd meta-campaign-agent
npm install
cp .env.example .env
# מלא את .env: ANTHROPIC_API_KEY, META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
npm start
```

תתחיל צ'אט חופשי, למשל:

```
> תראה לי את הקמפיינים הפעילים שלי ואיך הם מתפקדים בשבוע האחרון
> תשהה כל אדסט עם CPA מעל 50 שקל בקמפיין X
> תעלה את התקציב היומי של אדסט Y ב-20%
> תיצור קמפיין חדש למוצר Z עם 3 וריאציות קריאייטיב
```

## כלים זמינים לסוכן

קריאה: `list_campaigns`, `get_insights`, `list_adsets`, `list_ads`, `get_ad_creative`, `get_account_info`, `list_pages`.

ביצוע: `create_campaign`, `create_adset`, `create_ad_creative`, `create_ad`, `update_budget`, `set_status`, `upload_image`.

יצירות חדשות נוצרות כברירת מחדל במצב `PAUSED` כדי שתוכל לבדוק לפני שמוציאים תקציב בפועל.

## הערות אבטחה

- `.env` לא נכלל ב-git (`.gitignore`). לעולם אל תשמור טוקנים בקוד.
- הסוכן יכול לבצע פעולות שמוציאות כסף בפועל (הפעלת קמפיינים, הגדלת תקציבים). הוא מתוכנת לבקש אישור לפני פעולות גדולות, אבל זה עדיין כפוף למה שתבקש ממנו בצ'אט - קרא את ההודעות שלו לפני שאתה מאשר.
