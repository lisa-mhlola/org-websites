document.addEventListener("DOMContentLoaded", () => {
    highlightCurrentPage();
    buildAccordion();
    buildTabs();
    setUpEnquiryForm();
    setUpContactForm();
    showOpeningStatus();
    setUpScrollReveal();
    addBackToTopButton();
    updateFooterYear();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function highlightCurrentPage() {
    const currentPage = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("nav a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function buildAccordion() {
    const items = document.querySelectorAll(".accordion-item");
    if (items.length === 0) return;

    items.forEach((item, index) => {
        const heading = item.querySelector("h2");
        if (!heading) return;

        const panel = document.createElement("div");
        panel.className = "accordion-panel";
        panel.id = "accordion-panel-" + (index + 1);

        const inner = document.createElement("div");
        inner.className = "accordion-inner";

        while (heading.nextSibling) {
            inner.appendChild(heading.nextSibling);
        }

        panel.appendChild(inner);
        item.appendChild(panel);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "accordion-trigger";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", panel.id);

        const label = document.createElement("span");
        label.textContent = heading.textContent.trim();

        const icon = document.createElement("span");
        icon.className = "accordion-icon";
        icon.setAttribute("aria-hidden", "true");

        button.append(label, icon);
        heading.textContent = "";
        heading.appendChild(button);

        button.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");
            items.forEach((other) => setAccordionItem(other, false));
            setAccordionItem(item, !isOpen);
        });
    });

    setAccordionItem(items[0], true);
}

function setAccordionItem(item, open) {
    const button = item.querySelector(".accordion-trigger");
    if (!button) return;

    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
}

function buildTabs() {
    document.querySelectorAll(".tabs").forEach((tabsBox, boxIndex) => {
        const panels = Array.from(tabsBox.querySelectorAll(":scope > section"));
        if (panels.length < 2) return;

        const tabList = document.createElement("div");
        tabList.className = "tab-list";
        tabList.setAttribute("role", "tablist");

        const buttons = panels.map((panel, i) => {
            const heading = panel.querySelector("h2");
            const tabId = "tab-" + boxIndex + "-" + i;
            const panelId = "tabpanel-" + boxIndex + "-" + i;

            panel.id = panelId;
            panel.classList.add("tab-panel");
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", tabId);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "tab-button";
            button.id = tabId;
            button.setAttribute("role", "tab");
            button.setAttribute("aria-controls", panelId);
            button.textContent = heading
                ? heading.textContent.trim().replace(/^Our\s+/, "")
                : "Tab " + (i + 1);

            button.addEventListener("click", () => selectTab(i));
            tabList.appendChild(button);
            return button;
        });

        tabList.addEventListener("keydown", (event) => {
            const current = buttons.indexOf(document.activeElement);
            if (current === -1) return;

            let next = null;
            if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
            if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = buttons.length - 1;

            if (next !== null) {
                event.preventDefault();
                selectTab(next);
                buttons[next].focus();
            }
        });

        function selectTab(index) {
            buttons.forEach((button, i) => {
                const selected = i === index;
                button.setAttribute("aria-selected", String(selected));
                button.tabIndex = selected ? 0 : -1;
                panels[i].hidden = !selected;
            });
        }

        tabsBox.insertBefore(tabList, panels[0]);
        selectTab(0);
    });
}

function openModal(title, content) {
    let modal = document.querySelector(".modal");

    if (!modal) {
        modal = document.createElement("dialog");
        modal.className = "modal";
        modal.setAttribute("aria-labelledby", "modal-title");

        const header = document.createElement("div");
        header.className = "modal-header";

        const heading = document.createElement("h2");
        heading.id = "modal-title";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "modal-close";
        closeButton.setAttribute("aria-label", "Close");
        closeButton.textContent = "×";

        header.append(heading, closeButton);

        const body = document.createElement("div");
        body.className = "modal-body";

        const footer = document.createElement("div");
        footer.className = "modal-footer";

        const okButton = document.createElement("button");
        okButton.type = "button";
        okButton.className = "modal-ok";
        okButton.textContent = "OK";
        okButton.autofocus = true;
        footer.appendChild(okButton);

        modal.append(header, body, footer);
        document.body.appendChild(modal);

        closeButton.addEventListener("click", () => modal.close());
        okButton.addEventListener("click", () => modal.close());

        modal.addEventListener("click", (event) => {
            if (event.target === modal) modal.close();
        });
    }

    modal.querySelector("#modal-title").textContent = title;
    modal.querySelector(".modal-body").replaceChildren(content);
    modal.showModal();
}

function setUpEnquiryForm() {
    const serviceSelect = document.getElementById("service");
    if (!serviceSelect) return;

    const form = serviceSelect.closest("form");
    const dateInput = document.getElementById("date");
    const message = document.getElementById("message");

    if (dateInput) dateInput.min = todayAsISO();

    if (message) addCharacterCounter(message, 500);

    serviceSelect.addEventListener("change", () => toggleOtherField(serviceSelect));

    form.addEventListener("reset", () => {
        setTimeout(() => toggleOtherField(serviceSelect), 0);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();

        const content = document.createElement("div");
        const intro = document.createElement("p");
        intro.textContent = "Thank you, " + name + ". Here is a summary of your enquiry:";
        content.append(intro, buildSummary(form));

        openModal("Enquiry received", content);
        form.reset();
    });
}

function toggleOtherField(select) {
    const existing = document.getElementById("other-service-wrapper");

    if (select.value === "other" && !existing) {
        const wrapper = document.createElement("p");
        wrapper.id = "other-service-wrapper";
        wrapper.className = "fade-in";

        const label = document.createElement("label");
        label.htmlFor = "other-service";
        label.textContent = "Please describe the service you need:";

        const input = document.createElement("input");
        input.type = "text";
        input.id = "other-service";
        input.name = "other-service";
        input.required = true;

        wrapper.append(label, document.createElement("br"), input);
        select.closest("p").after(wrapper);
        input.focus();
    } else if (select.value !== "other" && existing) {
        existing.remove();
    }
}

function addCharacterCounter(textarea, max) {
    textarea.maxLength = max;

    const counter = document.createElement("small");
    counter.className = "char-counter";
    textarea.after(counter);

    const update = () => {
        const used = textarea.value.length;
        counter.textContent = used + " / " + max + " characters";
        counter.classList.toggle("near-limit", used > max * 0.9);
    };

    textarea.addEventListener("input", update);
    textarea.form.addEventListener("reset", () => setTimeout(update, 0));
    update();
}

function buildSummary(form) {
    const list = document.createElement("dl");
    list.className = "summary-list";

    Array.from(form.elements).forEach((field) => {
        if (!field.name || !field.value.trim()) return;

        const label = form.querySelector('label[for="' + field.id + '"]');

        const term = document.createElement("dt");
        term.textContent = label ? label.textContent.trim().replace(/:$/, "") : field.name;

        const detail = document.createElement("dd");
        if (field.tagName === "SELECT") {
            detail.textContent = field.options[field.selectedIndex].text.trim();
        } else if (field.type === "date") {
            detail.textContent = new Date(field.value + "T00:00").toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        } else {
            detail.textContent = field.value.trim();
        }

        list.append(term, detail);
    });

    return list;
}

function todayAsISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
}

function setUpContactForm() {
    const nameInput = document.getElementById("contact-name");
    if (!nameInput) return;

    const form = nameInput.closest("form");
    const message = document.getElementById("contact-message");
    if (message) addCharacterCounter(message, 500);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = document.getElementById("contact-email").value.trim();

        const content = document.createElement("p");
        content.textContent = "Thanks, " + name + ". We will reply to " + email + " within one working day.";

        openModal("Message sent", content);
        form.reset();
    });
}

function showOpeningStatus() {
    const table = document.querySelector("table");
    if (!table) return;

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Johannesburg",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const get = (type) => parts.find((part) => part.type === type).value;
    const today = get("weekday");
    const minutesNow = Number(get("hour")) * 60 + Number(get("minute"));

    let isOpen = false;
    let statusText = "Closed now";

    table.querySelectorAll("tbody tr").forEach((row) => {
        const dayCell = row.cells[0];
        const hoursCell = row.cells[1];
        if (dayCell.textContent.trim() !== today) return;

        row.classList.add("today");
        const badge = document.createElement("span");
        badge.className = "today-badge";
        badge.textContent = "Today";
        dayCell.appendChild(badge);

        const times = hoursCell.textContent.match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
        if (!times) return;

        const opens = Number(times[1]) * 60 + Number(times[2]);
        const closes = Number(times[3]) * 60 + Number(times[4]);

        if (minutesNow >= opens && minutesNow < closes) {
            isOpen = true;
            statusText = "Open now – closes at " + times[3] + ":" + times[4];
        } else if (minutesNow < opens) {
            statusText = "Closed now – opens today at " + times[1] + ":" + times[2];
        }
    });

    const status = document.createElement("p");
    status.className = "opening-status " + (isOpen ? "open" : "closed");
    status.textContent = statusText;
    table.before(status);
}

function setUpScrollReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll("main > section, main > form, main > .tabs");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach((target) => {
        target.classList.add("reveal");
        observer.observe(target);
    });
}

function addBackToTopButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.textContent = "↑";
    document.body.appendChild(button);

    window.addEventListener("scroll", () => {
        button.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
}

function updateFooterYear() {
    document.querySelectorAll("footer p").forEach((paragraph) => {
        if (paragraph.textContent.includes("©")) {
            paragraph.textContent = paragraph.textContent.replace(/\d{4}/, new Date().getFullYear());
        }
    });
}
