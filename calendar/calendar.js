const API = "https://seniorproject-jkm4.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const dayView           = document.getElementById("dayView");
  const currentDayDisplay = document.getElementById("currentDay");
  const prevBtn           = document.getElementById("prevDay");
  const nextBtn           = document.getElementById("nextDay");
  const goBackBtn         = document.getElementById("goBackButton");
  const adminLink         = document.getElementById("adminLink");

  let currentDate = new Date();

  // helper to convert "14:30" → "2:30 PM"
  function to12Hour(time24) {
    let [h, m] = time24.split(":").map(s => parseInt(s, 10));
    const suffix = h >= 12 ? "PM" : "AM";
    h = ((h + 11) % 12) + 1;
    return `${h}:${m.toString().padStart(2, "0")} ${suffix}`;
  }

  async function showDay(date) {
    // 1) header
    currentDayDisplay.textContent = date.toLocaleDateString("en-US", {
      weekday: "long",
      month:   "short",
      day:     "numeric",
    });
    dayView.innerHTML = "";

    // 2) fetch & render events
    try {
      const iso = date.toISOString().slice(0, 10);
      const res = await fetch(`${API}/api/events?date=${iso}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { events } = await res.json();

      if (!events.length) {
        dayView.textContent = "No events";
      } else {
        events.forEach(ev => {
          const div = document.createElement("div");
          div.className = "event";
          // convert both start/end to 12-hour
          div.textContent = `${to12Hour(ev.startTime)} – ${to12Hour(ev.endTime)}: ${ev.title}`;
          dayView.appendChild(div);
        });
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      dayView.textContent = "Error loading events";
    }
  }

  // Prev / Next
  prevBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);
    showDay(currentDate);
  });
  nextBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);
    showDay(currentDate);
  });

  // Go Back
  goBackBtn.addEventListener("click", () => {
    window.location.href = "/home/home.html";
  });

  // Admin link
  if (localStorage.getItem("role") === "admin") {
    adminLink.style.display = "inline-flex";
  }

  // initial render
  showDay(currentDate);
});