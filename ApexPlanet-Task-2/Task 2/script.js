   // --- Form Validation ---
      document.addEventListener("DOMContentLoaded", () => {
        const form = document.querySelector(".content");

        form.addEventListener("submit", (event) => {
          event.preventDefault();

          const name = form.querySelector('input[type="text"]').value.trim();
          const email = form.querySelector('input[type="email"]').value.trim();
          const message = form.querySelector("textarea").value.trim();

          const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

          if (name === "" || email === "" || message === "") {
            alert("Please fill in all required fields.");
            return;
          }

          if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
          }

          alert("Form submitted successfully!");
          form.reset();
        });
      });

      // --- To-Do List Functionality ---
      const addBtn = document.getElementById("addTask");
      const taskInput = document.getElementById("taskInput");
      const taskList = document.getElementById("taskList");

      addBtn.addEventListener("click", () => {
        const task = taskInput.value.trim();
        if (task === "") {
          alert("Please enter a task!");
          return;
        }

        const li = document.createElement("li");
        li.textContent = task;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.style.marginLeft = "10px";
        removeBtn.style.background = "red";
        removeBtn.style.color = "white";
        removeBtn.style.border = "none";
        removeBtn.style.borderRadius = "4px";
        removeBtn.style.cursor = "pointer";

        removeBtn.addEventListener("click", () => li.remove());

        li.appendChild(removeBtn);
        taskList.appendChild(li);
        taskInput.value = "";
      });