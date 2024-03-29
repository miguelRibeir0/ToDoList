const taskForm = document.getElementById("task-form");
const confirmCloseDialog = document.getElementById("confirm-close-dialog");
const openTaskFormBtn = document.getElementById("open-task-form-btn");
const closeTaskFormBtn = document.getElementById("close-task-form-btn");
const addOrUpdateTaskBtn = document.getElementById("add-or-update-task-btn");
const cancelBtn = document.getElementById("cancel-btn");
const discardBtn = document.getElementById("discard-btn");
const tasksContainer = document.getElementById("tasks-container");
const titleInput = document.getElementById("title-input");
const dateInput = document.getElementById("date-input");
const timeInput = document.getElementById("time-input");
const descriptionInput = document.getElementById("description-input");

const taskData = JSON.parse(localStorage.getItem("data")) || [];
let currentTask = {};

const addOrUpdateTask = () => {
  const dataArrIndex = taskData.findIndex((item) => item.id === currentTask.id);
  const taskObj = {
    id: `${titleInput.value.toLowerCase().split(" ").join("-")}-${Date.now()}`,
    title: titleInput.value,
    date: dateInput.value,
    time: timeInput.value,
    description: descriptionInput.value,
  };

  if (dataArrIndex === -1) {
    taskData.unshift(taskObj);
  } else {
    taskData[dataArrIndex] = taskObj;
  }

  localStorage.setItem("data", JSON.stringify(taskData));
  updateTaskContainer();
  reset();
};

const updateTaskContainer = () => {
  tasksContainer.innerHTML = "";

  const sortedTasks = taskData.sort((a, b) => {    // sort the tasks by the days remaining
    const currentDate = new Date();
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    const aTimeDiff = aDate.getTime() - currentDate.getTime();
    const bTimeDiff = bDate.getTime() - currentDate.getTime();
    const aDaysDiff = Math.ceil(aTimeDiff / (1000 * 3600 * 24));
    const bDaysDiff = Math.ceil(bTimeDiff / (1000 * 3600 * 24));

    return aDaysDiff - bDaysDiff;
  });

  sortedTasks.forEach(({ id, title, date, time, description }) => {
    const currentDate = new Date();
    const givenDate = new Date(date);
    const timeDiff = givenDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    tasksContainer.innerHTML += `
      <div class="task" id="${id}">
        <p><strong>Title:</strong> ${title}</p>
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ""}
        ${date ? `<p><strong>Date:</strong> ${date}</p>` : ""}
        ${time ? `<p><strong>Hour:</strong> ${time}h</p>` : ""}
        <p class="counter-label">Days remaining:</p><p class="counter-label-mobile">Days left:</p><span class="counter-circle"><p class="counter ${daysDiff < 0 ? "negative" : ""}">${daysDiff}</p></span>
        <button onclick="editTask(this)" type="button" class="btn btn-task">Edit</button>
        <button onclick="deleteTask(this)" type="button" class="btn btn-task">Delete</button>
      </div>
    `;
  });
};

const deleteTask = (buttonEl) => {
  const dataArrIndex = taskData.findIndex(
    (item) => item.id === buttonEl.parentElement.id
  );

  const confirmDelete = confirm("Are you sure you want to remove the task?");

  if (confirmDelete) {
    buttonEl.parentElement.remove();
    taskData.splice(dataArrIndex, 1);
    localStorage.setItem("data", JSON.stringify(taskData));
  }
};

const editTask = (buttonEl) => {
  const dataArrIndex = taskData.findIndex(
    (item) => item.id === buttonEl.parentElement.id
  );

  currentTask = taskData[dataArrIndex];

  titleInput.value = currentTask.title;
  dateInput.value = currentTask.date;
  timeInput.value = currentTask.time;
  descriptionInput.value = currentTask.description;

  addOrUpdateTaskBtn.innerText = "Update Task";

  taskForm.classList.toggle("hidden");
};

const reset = () => {
  titleInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
  descriptionInput.value = "";
  taskForm.classList.toggle("hidden");
  currentTask = {};
};

if (taskData.length) {
  updateTaskContainer();
}

openTaskFormBtn.addEventListener("click", () => {
  taskForm.classList.toggle("hidden");
  addOrUpdateTaskBtn.innerText = "Add Task";
});

closeTaskFormBtn.addEventListener("click", () => {
  const formInputsContainValues =
    titleInput.value ||
    dateInput.value ||
    descriptionInput.value ||
    timeInput.value;
  const formInputValuesUpdated =
    titleInput.value !== currentTask.title ||
    dateInput.value !== currentTask.date ||
    timeInput.value !== currentTask.time ||
    descriptionInput.value !== currentTask.description;

  if (formInputsContainValues && formInputValuesUpdated) {
    confirmCloseDialog.showModal();
  } else {
    reset();
  }
});

cancelBtn.addEventListener("click", () => confirmCloseDialog.close());

discardBtn.addEventListener("click", () => {
  confirmCloseDialog.close();
  reset();
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  addOrUpdateTask();
});

window.onload = function () {  //so the days remaining are updated when the page is loaded
  updateTaskContainer();
};