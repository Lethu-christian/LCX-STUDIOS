(async () => {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCU-w7GTrFyxf60NqZHL6KVrEjJApJN6Ug';
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
})();
