document.addEventListener("DOMContentLoaded", () => {
  const alarmsContainer = document.querySelector("#alarms-container");
  const alarmAudio = new Audio("ring.mp3"); // Path to your ringtone
  let alarmTimeout;
  let isAlarmStopped = false; // New flag to check if alarm has been stopped

  // Function to adjust the grid layout after deletion
  function adjustAlarmsGrid() {
    const alarms = document.querySelectorAll(".alarm");
    alarms.forEach((alarm, index) => {
      alarm.style.order = index; // Ensure the alarms are in the correct order
    });
  }

  // Load saved alarms from local storage on page load
  const savedAlarms = JSON.parse(localStorage.getItem("alarms")) || [];
  savedAlarms.forEach((alarm) => {
    createAlarmElement(alarm);
  });

  // Function to create the alarm container dynamically
  document.getElementById("create-btn").addEventListener("click", () => {
    const container = document.createElement("div");
    container.className = "container active";
    container.id = "add-alarm-modal";

    // Header Section
    const header = document.createElement("header");
    header.className = "content";

    const leftGroup = document.createElement("div");
    leftGroup.className = "left-group";

    const closeIcon = document.createElement("span");
    closeIcon.className = "icon";
    closeIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeIcon.addEventListener("click", () => container.remove());

    const headerTitle = document.createElement("h1");
    headerTitle.textContent = "Add Alarm";

    leftGroup.appendChild(closeIcon);
    leftGroup.appendChild(headerTitle);

    const checkIcon = document.createElement("span");
    checkIcon.className = "icon";
    checkIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    checkIcon.addEventListener("click", saveAlarm);

    header.appendChild(leftGroup);
    header.appendChild(checkIcon);

    const headings = document.createElement("div");
    headings.className = "headdiv";
    const hour = document.createElement("h1");
    hour.textContent = "Hours";
    const minute = document.createElement("h1");
    minute.textContent = "Minutes";
    const ampm = document.createElement("h1");
    ampm.textContent = "AM/PM";
    headings.appendChild(hour);
    headings.appendChild(minute);
    headings.appendChild(ampm);

    // Time Selector Section
    const timeSelector = document.createElement("div");
    timeSelector.className = "time-selector";

    const hoursSelect = document.createElement("select");
    hoursSelect.id = "hours";
    hoursSelect.name = "hours";

    // Loop to create hours options (1 to 12)
    for (let i = 1; i <= 12; i++) {
      const option = document.createElement("option");
      option.value = i < 10 ? `0${i}` : i; // Adding leading 0 for single-digit hours
      option.textContent = i < 10 ? `0${i}` : i;
      hoursSelect.appendChild(option);
    }

    const minutesSelect = document.createElement("select");
    minutesSelect.id = "minutes";
    minutesSelect.name = "minutes";

    // Loop to create minutes options (00 to 59)
    for (let i = 0; i < 60; i++) {
      const option = document.createElement("option");
      option.value = i < 10 ? `0${i}` : i; // Adding leading 0 for single-digit minutes
      option.textContent = i < 10 ? `0${i}` : i;
      minutesSelect.appendChild(option);
    }

    const ampmSelect = document.createElement("select");
    ampmSelect.id = "ampm";
    ampmSelect.name = "ampm";
    const ampmOptions = ["AM", "PM"];
    ampmOptions.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      ampmSelect.appendChild(option);
    });

    timeSelector.appendChild(hoursSelect);
    timeSelector.appendChild(minutesSelect);
    timeSelector.appendChild(ampmSelect);

    // Append everything to the container
    container.appendChild(header);
    container.appendChild(headings);
    container.appendChild(timeSelector);

    document.body.appendChild(container);
  });

  // Function to save the alarm
  function saveAlarm() {
    const hours = document.getElementById("hours").value;
    const minutes = document.getElementById("minutes").value;
    const ampm = document.getElementById("ampm").value;
    const alarmTime = `${hours}:${minutes} ${ampm}`;

    // Check for duplicate alarms
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    if (alarms.includes(alarmTime)) {
      alert("This alarm is already set!");
      return;
    }

    alarms.push(alarmTime);
    localStorage.setItem("alarms", JSON.stringify(alarms));

    // Create a new alarm element
    createAlarmElement(alarmTime);

    // Close the modal
    document.getElementById("add-alarm-modal").remove();
  }

  // Function to create an alarm element and add it to the alarms container
  function createAlarmElement(alarmTime) {
    const alarmDiv = document.createElement("div");
    alarmDiv.className = "alarm";
    alarmDiv.textContent = alarmTime;

    // Add a delete button to each alarm
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteAlarm(alarmDiv, alarmTime));

    alarmDiv.appendChild(deleteBtn);

    alarmsContainer.appendChild(alarmDiv);
  }

  // Function to delete an alarm
  function deleteAlarm(alarmDiv, alarmTime) {
    alarmDiv.remove();

    // Remove from local storage
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms = alarms.filter((alarm) => alarm !== alarmTime);
    localStorage.setItem("alarms", JSON.stringify(alarms));

    adjustAlarmsGrid(); // Re-adjust the grid layout after deletion
  }

  // Function to stop the alarm
  function clearAlarm() {
    alarmAudio.pause();

    clearTimeout(alarmTimeout);

    isAlarmStopped = true; // Set the flag to prevent re-triggering
  }

  // Function to check and ring the alarm
  function checkAlarm() {
    if (isAlarmStopped) return; // If the alarm was stopped, do nothing

    const now = new Date();
    let currentHour = now.getHours();
    const currentMinutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = currentHour >= 12 ? "PM" : "AM";
    currentHour = currentHour % 12 || 12; // Convert 24-hour format to 12-hour format
    const currentTime = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinutes} ${ampm}`;

    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];

    if (alarms.includes(currentTime)) {
      alarmAudio.play();

      // Check if the stop button already exists
      let existingStopButton = document.querySelector(".stop-button");
      if (!existingStopButton) {
        const contain = document.createElement("div");
        contain.className = "alarm-controls"; // Give a class for styling if needed

        // Create the heading
        const heading = document.createElement("h2");
        heading.textContent = "Do you want to stop the alarm?";
        contain.appendChild(heading);

        // Add a stop button to stop the alarm
        const stopBtn = document.createElement("button");
        stopBtn.className = "stop-button";
        stopBtn.textContent = "Stop Alarm";
        stopBtn.addEventListener("click", () => {
          clearAlarm(); // Stop the alarm
          contain.remove(); // Remove the button after stopping the alarm
        });

        contain.appendChild(stopBtn);
        document.body.appendChild(contain); // Append to the body or a specific container

        // Automatically clear the alarm and remove the stop button after one minute
        setTimeout(() => {
          clearAlarm(); // Stop the alarm sound
          contain.remove(); // Remove the stop button after one minute
        }, 60000); // 60000 milliseconds = 1 minute

        // Stop the alarm sound and remove the div if the time changes to the next minute
        const nextMinuteTimeout = setTimeout(() => {
          clearAlarm(); // Stop the alarm sound
          contain.remove(); // Remove the stop button after one minute
        }, 60000 - now.getSeconds() * 1000); // Timeout until the start of the next minute

        // Clear the timeout if the stop button is clicked
        stopBtn.addEventListener("click", () => {
          clearTimeout(nextMinuteTimeout); // Clear the timeout
        });
      }

      isAlarmStopped = false; // Reset the flag to allow further checks
      alarmTimeout = setTimeout(() => clearAlarm(), 60000); // Automatically stop the alarm after 1 minute
    }
  }

  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();
    const secondsDegrees = seconds * 6;
    const minutesDegrees = minutes * 6 + (seconds / 60) * 6;
    const hoursDegrees = (hours % 12) * 30 + (minutes / 60) * 30;
    document.querySelector(
      ".line3"
    ).style.transform = `rotate(${secondsDegrees}deg)`;
    document.querySelector(
      ".line2"
    ).style.transform = `rotate(${minutesDegrees}deg)`;
    document.querySelector(
      ".line1"
    ).style.transform = `rotate(${hoursDegrees}deg)`;

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayOfWeek = daysOfWeek[now.getDay()];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const dateString = `<span class="date-span">${dayOfWeek}, ${month} ${day}</span>`;
    document.querySelector(
      ".timer"
    ).innerHTML = `${timeString}<br>${dateString}`;
  }

  setInterval(updateClock, 1000); // Update the clock every second
  setInterval(checkAlarm, 1000); // Check the alarm every second
  updateClock();
});
