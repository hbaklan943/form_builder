// Helper function to create an element with attributes and children.
function createElement(tag, attributes = {}, ...children) {
  const elem = document.createElement(tag);
  for (const key in attributes) {
    if (key === "class") {
      elem.className = attributes[key];
    } else {
      elem.setAttribute(key, attributes[key]);
    }
  }
  children.forEach((child) => {
    if (typeof child === "string") {
      elem.appendChild(document.createTextNode(child));
    } else if (child) {
      elem.appendChild(child);
    }
  });
  return elem;
}

// Add a new field definition when "Add Field" is clicked.
document.getElementById("add-field").addEventListener("click", function () {
  const fieldDefDiv = createElement("div", {
    class: "field-definition",
  }); // Main div for field definition

  // Field Label input
  const labelWrapper = createElement("label", {}, "Field Label: ");
  const labelInput = createElement("input", {
    type: "text",
    class: "field-label",
    placeholder: "Enter field name",
  });
  labelWrapper.appendChild(labelInput);

  // Field Type select
  const typeWrapper = createElement("label", {}, "Field Type: ");
  const typeSelect = createElement("select", { class: "field-type" });
  const optionText = createElement("option", { value: "text" }, "Text");
  const optionSelect = createElement("option", { value: "select" }, "Select");
  typeSelect.appendChild(optionText);
  typeSelect.appendChild(optionSelect);
  typeWrapper.appendChild(typeSelect);

  // Options input container (only for "select" type)
  const optionsDiv = createElement("div", {
    class: "select-options hidden",
  });
  const optionsLabel = createElement(
    "label",
    {},
    "Options (comma separated): "
  );
  const optionsInput = createElement("input", {
    type: "text",
    class: "field-options",
    placeholder: "Option1, Option2, Option3",
  });
  optionsLabel.appendChild(optionsInput);
  optionsDiv.appendChild(optionsLabel);

  // Remove Field button
  const removeBtn = createElement(
    "button",
    { type: "button", class: "remove-field" },
    "Remove Field"
  );

  // Append elements to the field definition div
  fieldDefDiv.appendChild(labelWrapper);
  fieldDefDiv.appendChild(typeWrapper);
  fieldDefDiv.appendChild(optionsDiv);
  fieldDefDiv.appendChild(removeBtn);

  // Append the field definition div to the field builder container
  document.getElementById("field-builder").appendChild(fieldDefDiv);

  // Toggle options input visibility based on selected field type.
  typeSelect.addEventListener("change", function () {
    if (this.value === "select") {
      optionsDiv.classList.remove("hidden");
    } else {
      optionsDiv.classList.add("hidden");
    }
  });

  // Remove the field definition when "Remove Field" is clicked.
  removeBtn.addEventListener("click", function () {
    fieldDefDiv.remove();
  });
});

// Generate the data entry form when "Generate Form" is clicked.
document.getElementById("generate-form").addEventListener("click", function () {
  const fieldDefinitions = document.querySelectorAll(".field-definition");
  const formContainer = document.getElementById("generated-form");
  formContainer.innerHTML = ""; // Clear previous form if any.
  const form = createElement("form", { id: "dynamic-form" });

  // Loop through each field definition to create corresponding form fields.
  fieldDefinitions.forEach((fieldDef, index) => {
    const labelInput = fieldDef.querySelector(".field-label");
    const typeSelect = fieldDef.querySelector(".field-type");
    let fieldLabel = labelInput.value.trim();
    if (!fieldLabel) {
      fieldLabel = "Field " + (index + 1);
    }
    const formGroup = createElement("div", { class: "form-group" });
    const labelElem = createElement("label", {}, fieldLabel + ": ");
    formGroup.appendChild(labelElem);

    if (typeSelect.value === "text") {
      const inputElem = createElement("input", {
        type: "text",
        name: fieldLabel,
      });
      formGroup.appendChild(inputElem);
    } else if (typeSelect.value === "select") {
      const selectElem = createElement("select", { name: fieldLabel });
      const optionsInput = fieldDef.querySelector(".field-options").value;
      // Create options by splitting comma-separated values.
      const options = optionsInput
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt !== "");
      options.forEach((opt) => {
        const optionElem = createElement("option", { value: opt }, opt);
        selectElem.appendChild(optionElem);
      });
      formGroup.appendChild(selectElem);
    }
    form.appendChild(formGroup);
  });

  // Create the "Save Data" button.
  const submitBtn = createElement("button", { type: "submit" }, "Save Data");
  form.appendChild(submitBtn);
  formContainer.appendChild(form);

  // Handle form submission to collect data and display it in the table.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });

    const table = document.getElementById("data-table");

    // Update (or create) the table header based on the submitted data.
    let thead = table.querySelector("thead");
    if (!thead) {
      // Create the header if it doesn't exist.
      thead = createElement("thead");
      const headerRow = createElement("tr");
      for (const key in dataObj) {
        headerRow.appendChild(createElement("th", {}, key));
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);
    } else {
      // If header exists, check if there are any new keys.
      const headerRow = thead.querySelector("tr");
      // Get an array of existing header keys.
      const existingKeys = Array.from(headerRow.children).map(
        (th) => th.textContent
      );
      const newKeys = Object.keys(dataObj);
      let keysAdded = false;
      newKeys.forEach((key) => {
        if (!existingKeys.includes(key)) {
          // Append new header cell if key is missing.
          headerRow.appendChild(createElement("th", {}, key));
          keysAdded = true;
        }
      });
      // If we added new header cells, update each existing row with an empty cell for the new column(s).
      if (keysAdded) {
        const tbody = table.querySelector("tbody");
        if (tbody) {
          // For each row, append empty cells for the new keys.
          Array.from(tbody.rows).forEach((row) => {
            // For each new key missing in the row, append an empty cell.
            newKeys.forEach((key) => {
              if (!existingKeys.includes(key)) {
                row.appendChild(createElement("td", {}, ""));
              }
            });
          });
        }
      }
    }

    // Create the table body if it doesn't exist.
    let tbody = table.querySelector("tbody");
    if (!tbody) {
      tbody = createElement("tbody");
      table.appendChild(tbody);
    }

    // Create a new row using the header order to ensure cells align correctly.
    const headerRow = table.querySelector("thead tr");
    const headerKeys = Array.from(headerRow.children).map(
      (th) => th.textContent
    );
    const row = createElement("tr");
    headerKeys.forEach((key) => {
      // If the submitted data does not have a value for this key, use an empty string.
      row.appendChild(createElement("td", {}, dataObj[key] || ""));
    });
    tbody.appendChild(row);

    // Optionally, reset the form after submission.
    form.reset();
  });
});
