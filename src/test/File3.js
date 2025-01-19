function createDynamicElements() {
    // This function has a memory leak because event listeners are not removed
    // when elements are replaced
    const container = document.getElementById('container');
    
    setInterval(() => {
        // Create new button element
        const button = document.createElement('button');
        button.textContent = 'Click me';
        
        // Add event listener - This is the source of the leak
        // Every time this runs, a new event listener is added but old ones are never cleaned up
        button.addEventListener('click', () => {
            console.log('Button clicked');
            // Some heavy data processing
            const heavyData = new Array(10000).fill('data');
            processData(heavyData);
        });
        
        // Replace old content - but event listeners from old elements remain in memory
        container.innerHTML = '';
        container.appendChild(button);
    }, 1000);
}

function processData(data) {
    // Simulate some data processing
    return data.map(item => item.toUpperCase());
}