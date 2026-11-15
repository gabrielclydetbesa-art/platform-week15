(function () {
    var STORAGE_KEY = "campus-records-students";

    var seed = [
        { id: "2026-0101", name: "Maria Santos", course: "BS Information Technology", year: "3", status: "Enrolled" },
        { id: "2026-0102", name: "Jose Reyes", course: "BS Computer Science", year: "2", status: "Enrolled" },
        { id: "2026-0103", name: "Angela Cruz", course: "BS Information Systems", year: "4", status: "Enrolled" },
        { id: "2026-0104", name: "Paolo Garcia", course: "BS Entertainment and Multimedia Computing", year: "1", status: "Enrolled" },
        { id: "2025-0088", name: "Kristine Ramos", course: "BS Information Technology", year: "4", status: "Graduated" },
        { id: "2026-0105", name: "Daniel Mendoza", course: "BS Computer Science", year: "3", status: "On leave" }
    ];

    var students = load();

    var rows = document.getElementById("student-rows");
    var empty = document.getElementById("empty");
    var search = document.getElementById("search");
    var form = document.getElementById("student-form");
    var message = document.getElementById("form-message");

    function load() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            return seed.slice();
        }
        return seed.slice();
    }

    function save() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        } catch (error) {
            return;
        }
    }

    function badgeClass(status) {
        if (status === "Enrolled") {
            return "enrolled";
        }
        if (status === "Graduated") {
            return "graduated";
        }
        return "leave";
    }

    function yearLabel(year) {
        var suffix = { "1": "st", "2": "nd", "3": "rd", "4": "th" };
        return year + (suffix[year] || "th");
    }

    function cell(text) {
        var td = document.createElement("td");
        td.textContent = text;
        return td;
    }

    function render() {
        var query = search.value.trim().toLowerCase();
        var visible = students.filter(function (s) {
            return (s.id + " " + s.name + " " + s.course).toLowerCase().indexOf(query) !== -1;
        });

        rows.innerHTML = "";

        visible.forEach(function (s) {
            var tr = document.createElement("tr");
            tr.appendChild(cell(s.id));
            tr.appendChild(cell(s.name));
            tr.appendChild(cell(s.course));
            tr.appendChild(cell(yearLabel(s.year)));

            var statusCell = document.createElement("td");
            var badge = document.createElement("span");
            badge.className = "badge " + badgeClass(s.status);
            badge.textContent = s.status;
            statusCell.appendChild(badge);
            tr.appendChild(statusCell);

            var actionCell = document.createElement("td");
            var remove = document.createElement("button");
            remove.type = "button";
            remove.className = "remove";
            remove.textContent = "Remove";
            remove.setAttribute("aria-label", "Remove " + s.name);
            remove.addEventListener("click", function () {
                students = students.filter(function (item) {
                    return item.id !== s.id;
                });
                save();
                render();
            });
            actionCell.appendChild(remove);
            tr.appendChild(actionCell);

            rows.appendChild(tr);
        });

        empty.hidden = visible.length !== 0;
        updateStats();
    }

    function updateStats() {
        var courses = {};
        var active = 0;
        students.forEach(function (s) {
            courses[s.course] = true;
            if (s.status === "Enrolled") {
                active += 1;
            }
        });
        document.getElementById("stat-total").textContent = students.length;
        document.getElementById("stat-active").textContent = active;
        document.getElementById("stat-courses").textContent = Object.keys(courses).length;
    }

    function setError(field, text) {
        var wrapper = document.getElementById("f-" + field).closest(".field");
        document.getElementById("e-" + field).textContent = text;
        if (text) {
            wrapper.classList.add("invalid");
        } else {
            wrapper.classList.remove("invalid");
        }
    }

    function validate(data) {
        var ok = true;

        if (!/^\d{4}-\d{4}$/.test(data.id)) {
            setError("id", "Use the format 2026-0107.");
            ok = false;
        } else if (students.some(function (s) { return s.id === data.id; })) {
            setError("id", "This student ID already exists.");
            ok = false;
        } else {
            setError("id", "");
        }

        if (data.name.length < 3) {
            setError("name", "Enter the student's full name.");
            ok = false;
        } else {
            setError("name", "");
        }

        if (!data.course) {
            setError("course", "Choose a course.");
            ok = false;
        } else {
            setError("course", "");
        }

        if (!data.year) {
            setError("year", "Choose a year level.");
            ok = false;
        } else {
            setError("year", "");
        }

        return ok;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        message.textContent = "";

        var data = {
            id: form.elements.id.value.trim(),
            name: form.elements.name.value.trim(),
            course: form.elements.course.value,
            year: form.elements.year.value,
            status: form.elements.status.value
        };

        if (!validate(data)) {
            return;
        }

        students.unshift(data);
        save();
        form.reset();
        search.value = "";
        render();
        message.textContent = data.name + " was added to the student list.";
    });

    search.addEventListener("input", render);

    render();
})();
