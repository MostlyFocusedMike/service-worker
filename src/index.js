console.log('test 2');

const button = document.getElementById('send');
button.addEventListener('click', (e) => {
    console.log('new click 3');
    fetch('http://localhost:4321/api/test3').then((r) => r.json()).then(console.log);
});

const register = async () => {
    try {
        console.log('i am called: ');
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('CLIENT: service worker registration complete.');
    } catch (e) {
        console.log('CLIENT: service worker registration failure.');
    }
};

if ('serviceWorker' in navigator) {
    console.log('CLIENT: service worker registration in progress.');
    register();
} else {
    console.log('CLIENT: service worker is not supported.');
}
