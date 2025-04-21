document.addEventListener('DOMContentLoaded', function() {
    const dayView = document.getElementById('dayView');
    const currentDayDisplay = document.getElementById('currentDay');
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');

    let currentDate = new Date();
    let currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Function to display the events for a given day
    function showDay(date) {
        currentDayDisplay.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        dayView.innerHTML = ''; // Clear previous events

        const dayOfWeek = date.getDay();
        if (dayOfWeek === 5) { // Friday
            displayEvents(fridayEvents);
        } else if (dayOfWeek === 6) { // Saturday
            displayEvents(saturdayEvents);
        }
    }

    // Function to add events to the day view
    function displayEvents(events) {
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';
            eventDiv.textContent = `${event.time} - ${event.title}`;
            dayView.appendChild(eventDiv);
        });
    }

    // Event data
    const fridayEvents = [
        { time: '4:30 PM', title: 'Team Check in' },
        { time: '5:00 PM', title: 'Kickoff' },
        { time: '8:00 PM', title: 'Capitalone workshop' },
        { time: '9:30 PM', title: 'Team Check in' },
        { time: '10:00 PM', title: 'Dinner' }
    ];

    const saturdayEvents = [
        { time: '9:00 AM', title: 'Breakfast' },
        { time: '12:00 PM', title: 'Lunch' },
        { time: '2:50 PM', title: 'Project Submissions due' }
    ];

    // Initial display
    showDay(currentDate);

    // Navigation buttons
    prevDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        showDay(currentDate);
    });

    nextDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        showDay(currentDate);
    });

    // Go Back button
    document.getElementById("goBackButton").addEventListener("click", () => {
        window.location.href = "/home/home.html";
    });
    
    // Show admin link if role is admin
    const role = localStorage.getItem("role");
    if (role === "admin") {
        document.getElementById("adminLink").style.display = "inline-flex";
    }
});