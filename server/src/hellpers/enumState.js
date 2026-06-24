const State = {
    TODO: "TODO",
    INPROGRESS: "INPROGRESS",
    DONE: "DONE",
    CANCELLED: "CANCELLED",
    REVIEW: "REVIEW"
};

const Severity = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL"
};

const Priority = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT"
};

const Type = {
    BUG: "BUG",
    FEATURE: "FEATURE",
    IMPROVEMENT: "IMPROVEMENT",
    TASK: "TASK"
};

module.exports = { State, Severity, Priority, Type };