document.addEventListener("DOMContentLoaded", function() {
    // Find all select elements except those we might want to exclude
    const selects = document.querySelectorAll("select:not(.no-custom-select)");

    selects.forEach(select => {
        // 1. Hide original select
        select.style.display = "none";

        // 2. Create wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "custom-select-wrapper " + select.className;
        // Inherit ID if any for labeling logic, though keeping ID on select is usually better for forms
        
        // Insert wrapper before select, then move select inside wrapper
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        // 3. Create Trigger
        const trigger = document.createElement("div");
        trigger.className = "custom-select-trigger";
        
        // Find selected option text
        let selectedOption = select.options[select.selectedIndex];
        let triggerText = selectedOption ? selectedOption.text : select.options[0].text;
        
        trigger.innerHTML = `<span>${triggerText}</span> <i class="fas fa-chevron-down"></i>`;
        wrapper.appendChild(trigger);

        // 4. Create Options Container
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "custom-select-options";

        // Loop through original options
        Array.from(select.options).forEach(option => {
            const customOption = document.createElement("div");
            customOption.className = "custom-option";
            if(option.selected) customOption.classList.add("selected");
            customOption.textContent = option.text;
            customOption.dataset.value = option.value;

            // Click event for option
            customOption.addEventListener("click", function(e) {
                e.stopPropagation(); // prevent wrapper click
                
                // Update original select
                select.value = this.dataset.value;
                // Dispatch change event for other scripts to catch
                select.dispatchEvent(new Event('change'));

                // Update Trigger text
                trigger.querySelector("span").textContent = this.textContent;

                // Update selected class
                optionsContainer.querySelectorAll(".custom-option").forEach(opt => opt.classList.remove("selected"));
                this.classList.add("selected");

                // Close dropdown
                wrapper.classList.remove("open");
            });

            optionsContainer.appendChild(customOption);
        });

        wrapper.appendChild(optionsContainer);

        // 5. Click event for Trigger
        trigger.addEventListener("click", function(e) {
            e.stopPropagation();
            // Close all other open selects
            document.querySelectorAll(".custom-select-wrapper").forEach(w => {
                if (w !== wrapper) w.classList.remove("open");
            });
            wrapper.classList.toggle("open");
        });
    });

    // Close select when clicking outside
    document.addEventListener("click", function() {
        document.querySelectorAll(".custom-select-wrapper").forEach(w => w.classList.remove("open"));
    });
});
