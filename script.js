document.addEventListener("DOMContentLoaded", () => {
    highlightCurrentPage();
    buildAccordion();
    buildTabs();
    setUpServiceListings();
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

const servicePackages = [
    {
        name: "Standard Home Clean",
        category: "home",
        price: 450,
        hours: 3,
        description: "A full clean of kitchens, bathrooms, bedrooms and living areas, including dusting and floors."
    },
    {
        name: "Apartment Express Clean",
        category: "home",
        price: 350,
        hours: 2,
        description: "A quick, thorough clean for flats and small apartments of up to two bedrooms."
    },
    {
        name: "Family Home Clean",
        category: "home",
        price: 650,
        hours: 4,
        description: "A larger clean for busy family homes with three or more bedrooms."
    },
    {
        name: "Weekly Maintenance Clean",
        category: "home",
        price: 380,
        hours: 2,
        description: "A regular weekly visit that keeps your home tidy between bigger cleans."
    },
    {
        name: "Small Office Clean",
        category: "office",
        price: 600,
        hours: 3,
        description: "Desks, floors, bins and shared areas cleaned for offices of up to ten people."
    },
    {
        name: "Reception and Boardroom Clean",
        category: "office",
        price: 500,
        hours: 2,
        description: "Keeps the spaces your clients see first spotless and professional."
    },
    {
        name: "Office Kitchen and Staff Area Clean",
        category: "office",
        price: 450,
        hours: 2,
        description: "Kitchens, fridges, microwaves and break areas cleaned and sanitised."
    },
    {
        name: "After-Hours Office Clean",
        category: "office",
        price: 850,
        hours: 4,
        description: "A full office clean done after work hours, so your team is never disturbed."
    },
    {
        name: "Move-In or Move-Out Clean",
        category: "deep",
        price: 1200,
        hours: 6,
        description: "A top-to-bottom clean of an empty property, including inside cupboards and appliances."
    },
    {
        name: "Spring Deep Clean",
        category: "deep",
        price: 950,
        hours: 5,
        description: "A detailed clean of hard-to-reach areas, skirting boards, windows and fittings."
    },
    {
        name: "Kitchen Deep Clean",
        category: "deep",
        price: 550,
        hours: 3,
        description: "Degreasing of stoves, ovens, extractor fans, tiles and cupboard fronts."
    },
    {
        name: "Bathroom Deep Clean",
        category: "deep",
        price: 400,
        hours: 2,
        description: "Descaling of showers, taps and tiles, plus a scrub of grout and fittings."
    }
];

const categoryNames = {
    home: "Home Cleaning",
    office: "Office Cleaning",
    deep: "Deep Cleaning"
};

function loadServicePackages() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(servicePackages), 400);
    });
}

function setUpServiceListings() {
    const list = document.getElementById("service-list");
    if (!list) return;

    const searchInput = document.getElementById("service-search");
    const categorySelect = document.getElementById("service-category");
    const sortSelect = document.getElementById("service-sort");
    const countText = document.getElementById("service-count");
    const loadMoreButton = document.getElementById("load-more");
    const pageSize = 6;
    let visibleCount = pageSize;
    let packages = [];

    const loading = document.createElement("p");
    loading.className = "service-loading";
    loading.textContent = "Loading services...";
    list.replaceChildren(loading);
    countText.textContent = "";

    function getResults() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categorySelect.value;

        const matches = packages.filter((item) => {
            const matchesCategory = category === "all" || item.category === category;
            const searchText = (item.name + " " + item.description + " " + categoryNames[item.category]).toLowerCase();
            return matchesCategory && searchText.includes(query);
        });

        return sortPackages(matches, sortSelect.value);
    }

    function render(animateFrom) {
        const query = searchInput.value.trim().toLowerCase();
        const results = getResults();
        const shown = results.slice(0, visibleCount);

        if (results.length === 0) {
            list.replaceChildren(createEmptyMessage(searchInput.value.trim(), clearFilters));
            countText.textContent = "No services found";
            loadMoreButton.hidden = true;
            return;
        }

        const cards = shown.map((item, index) => {
            const card = createServiceCard(item, query);
            if (animateFrom !== undefined && index >= animateFrom) {
                card.classList.add("is-new");
                card.style.animationDelay = (index - animateFrom) * 60 + "ms";
            }
            return card;
        });

        list.replaceChildren(...cards);
        countText.textContent = "Showing " + shown.length + " of " + results.length +
            (results.length === 1 ? " service" : " services");
        loadMoreButton.hidden = shown.length >= results.length;
    }

    function resetAndRender() {
        visibleCount = pageSize;
        render();
    }

    function clearFilters() {
        searchInput.value = "";
        categorySelect.value = "all";
        resetAndRender();
        searchInput.focus();
    }

    searchInput.addEventListener("input", resetAndRender);
    categorySelect.addEventListener("change", resetAndRender);
    sortSelect.addEventListener("change", resetAndRender);

    loadMoreButton.addEventListener("click", () => {
        const previousCount = visibleCount;
        visibleCount += pageSize;
        render(previousCount);
    });

    loadServicePackages().then((data) => {
        packages = data;
        render(0);
    });
}

function sortPackages(items, sortBy) {
    const sorted = items.slice();

    if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
    if (sortBy === "duration") sorted.sort((a, b) => a.hours - b.hours);
    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));

    return sorted;
}

function createServiceCard(item, query) {
    const card = document.createElement("article");
    card.className = "service-card";

    const badge = document.createElement("span");
    badge.className = "service-badge " + item.category;
    badge.textContent = categoryNames[item.category];

    const title = document.createElement("h3");
    title.append(highlightText(item.name, query));

    const description = document.createElement("p");
    description.append(highlightText(item.description, query));

    const meta = document.createElement("p");
    meta.className = "service-meta";

    const duration = document.createElement("span");
    duration.textContent = item.hours + (item.hours === 1 ? " hour" : " hours");

    const price = document.createElement("strong");
    price.textContent = "From R" + item.price.toLocaleString("en-ZA");

    meta.append(duration, price);

    const link = document.createElement("a");
    link.className = "service-link";
    link.href = "enquiry.html?" + new URLSearchParams({ service: item.category, package: item.name });
    link.textContent = "Enquire about this";

    card.append(badge, title, description, meta, link);
    return card;
}

function highlightText(text, query) {
    const fragment = document.createDocumentFragment();

    if (!query) {
        fragment.append(text);
        return fragment;
    }

    const lowerText = text.toLowerCase();
    let start = 0;
    let index = lowerText.indexOf(query);

    while (index !== -1) {
        fragment.append(text.slice(start, index));

        const mark = document.createElement("mark");
        mark.textContent = text.slice(index, index + query.length);
        fragment.append(mark);

        start = index + query.length;
        index = lowerText.indexOf(query, start);
    }

    fragment.append(text.slice(start));
    return fragment;
}

function createEmptyMessage(searchTerm, onClear) {
    const box = document.createElement("div");
    box.className = "service-empty";

    const message = document.createElement("p");
    message.textContent = searchTerm
        ? "No services match \"" + searchTerm + "\"."
        : "No services match these filters.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "clear-filters";
    button.textContent = "Clear search";
    button.addEventListener("click", onClear);

    box.append(message, button);
    return box;
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

    const params = new URLSearchParams(location.search);
    const requestedService = params.get("service");
    const requestedPackage = params.get("package");

    if (requestedService && Array.from(serviceSelect.options).some((option) => option.value === requestedService)) {
        serviceSelect.value = requestedService;
    }

    if (requestedPackage && message) {
        message.value = "I am interested in the " + requestedPackage + " package.";
    }

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

    table.querySelectorAll("tbody tr").forEach((row) =>
