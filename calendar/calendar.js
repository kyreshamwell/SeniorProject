const API = "https://seniorproject-jkm4.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const dayView          = document.getElementById("dayView");
  const currentDayDisplay= document.getElementById("currentDay");
  const prevBtn          = document.getElementById("prevDay");
  const nextBtn          = document.getElementById("nextDay");
  const goBackBtn        = document.getElementById("goBackButton");
  const adminLink        = document.getElementById("adminLink");

  let currentDate = new Date();

  // 1) Fetch & render for a given day
  async function showDay(date) {
    // update header
    currentDayDisplay.textContent = date.toLocaleDateString("en-US", {
      weekday: "long",
      month:   "short",
      day:     "numeric",
    });
    dayView.innerHTML = "";

    // fetch events
    const iso = date.toISOString().slice(0, 10);
    const res = await fetch(`${API}/api/events?date=${iso}`);
    const { events } = await res.json();

    if (!events.length) {
      dayView.textContent = "No events";
    } else {
      events.forEach((ev) => {
        const div = document.createElement("div");
        div.className = "event";
        div.textContent = `${ev.startTime}–${ev.endTime}: ${ev.title}`;
        dayView.appendChild(div);
      });
    }
  }

  // 2) Prev / Next buttons
  prevBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);
    showDay(currentDate);
  });
  nextBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);
    showDay(currentDate);
  });

  // 3) Go Back button
  goBackBtn.addEventListener("click", () => {
    window.location.href = "/home/home.html";
  });

  // 4) Show Admin link if the user is an admin
  const role = localStorage.getItem("role");
  if (role === "admin") {
    adminLink.style.display = "inline-flex";
  }

  // Initial load
  showDay(currentDate);
});