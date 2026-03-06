(async () => {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCU-w7GTrFyxf60NqZHL6KVrEjJApJN6Ug';
    const res = await fetch(url);
    console.log(await res.text());
})();
