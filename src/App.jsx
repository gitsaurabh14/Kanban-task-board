import { useEffect, useMemo, useState } from "react";

const columns = [
  { id: "todo", label: "To Do", icon: "○" },
  { id: "progress", label: "In Progress", icon: "◐" },
  { id: "completed", label: "Completed", icon: "✓" },
];

const emptyTask = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  status: "todo",
};

const starterTasks = [
  {
    id: "1",
    title: "Design landing page",
    description: "Create a clean, responsive landing page layout.",
    priority: "High",
    dueDate: "2026-11-05",
    status: "todo",
  },
  {
    id: "2",
    title: "Set up project repository",
    description: "Initialize the app and add project documentation.",
    priority: "Medium",
    dueDate: "2026-11-02",
    status: "progress",
  },
  {
    id: "3",
    title: "Research user flows",
    description: "Map the key user journeys for the product.",
    priority: "Low",
    dueDate: "2026-10-29",
    status: "completed",
  },
];

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("flowboard-tasks")) || starterTasks;
  } catch {
    return starterTasks;
  }
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || emptyTask);
  const [error, setError] = useState("");
  const edit = Boolean(task);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("A task title is required.");
    onSave({
      ...form,
      title: form.title.trim(),
      id: task?.id || crypto.randomUUID(),
    });
  };
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{edit ? "Update task" : "Create task"}</p>
            <h2>{edit ? "Edit task" : "Add a new task"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            Title <span>*</span>
            <input
              autoFocus
              name="title"
              value={form.title}
              onChange={change}
              placeholder="What needs to be done?"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              placeholder="Add a short description (optional)"
              rows="3"
            />
          </label>
          <div className="form-row">
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={change}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label>
              Due date
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={change}
              />
            </label>
          </div>
          <label>
            Status
            <select name="status" value={form.status} onChange={change}>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              {edit ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onMove }) {
  const due =
    task.dueDate &&
    new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  const index = columns.findIndex((c) => c.id === task.status);
  return (
    <article className="task-card">
      <div className="card-top">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <div className="card-actions">
          <button onClick={() => onEdit(task)} title="Edit task">
            ✎
          </button>
          <button onClick={() => onDelete(task.id)} title="Delete task">
            ×
          </button>
        </div>
      </div>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="card-footer">
        <span className="due">{due ? `◷ ${due}` : "No due date"}</span>
        <div className="move-controls">
          {index > 0 && (
            <button
              onClick={() => onMove(task.id, columns[index - 1].id)}
              title="Move left"
            >
              ‹
            </button>
          )}
          {index < columns.length - 1 && (
            <button
              onClick={() => onMove(task.id, columns[index + 1].id)}
              title="Move right"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [modalTask, setModalTask] = useState(null);
  const [adding, setAdding] = useState(false);
  useEffect(
    () => localStorage.setItem("flowboard-tasks", JSON.stringify(tasks)),
    [tasks],
  );
  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) &&
          (priority === "All" || t.priority === priority) &&
          (status === "All" || t.status === status),
      ),
    [tasks, query, priority, status],
  );
  const save = (task) => {
    setTasks((old) =>
      old.some((t) => t.id === task.id)
        ? old.map((t) => (t.id === task.id ? task : t))
        : [...old, task],
    );
    setModalTask(null);
    setAdding(false);
  };
  const remove = (id) => {
    if (window.confirm("Delete this task?"))
      setTasks((old) => old.filter((t) => t.id !== id));
  };
  const move = (id, newStatus) =>
    setTasks((old) =>
      old.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
  const clearFilters = () => {
    setQuery("");
    setPriority("All");
    setStatus("All");
  };
  return (
    <main>
      <header className="hero">
        <div>
          <div className="brand">
            <span className="logo">📝</span> TaskBoard
          </div>
          <h1>
            Plan less. <em>Do more.</em>
          </h1>
          <p>A simple space to keep your work moving forward.</p>
        </div>
        <button className="primary add-button" onClick={() => setAdding(true)}>
          <b>+</b> Add task
        </button>
      </header>
      <section className="toolbar" aria-label="Task filters">
        <div className="search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
          />
        </div>
        <div className="filters">
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="All">All priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All statuses</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="board">
        {columns.map((column) => {
          const list = filtered.filter((t) => t.status === column.id);
          return (
            <section className="column" key={column.id}>
              <div className="column-heading">
                <h2>
                  <span className={`status-icon ${column.id}`}>
                    {column.icon}
                  </span>
                  {column.label}
                </h2>
                <span className="count">{list.length}</span>
              </div>
              <div className="task-list">
                {list.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setModalTask}
                    onDelete={remove}
                    onMove={move}
                  />
                ))}
                {list.length === 0 && (
                  <div className="empty-column">No tasks here yet</div>
                )}
              </div>
            </section>
          );
        })}
      </section>
      {filtered.length === 0 && (
        <section className="no-results">
          <div>⌕</div>
          <h2>No matching tasks</h2>
          <p>Try changing your search or filters.</p>
          <button className="secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </section>
      )}
      {(adding || modalTask) && (
        <TaskModal
          task={modalTask}
          onClose={() => {
            setAdding(false);
            setModalTask(null);
          }}
          onSave={save}
        />
      )}
    </main>
  );
}
