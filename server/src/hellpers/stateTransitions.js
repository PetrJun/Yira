const { State } = require("./enumState");

const transitions = {
    [State.TODO]:       [State.INPROGRESS, State.CANCELLED],
    [State.INPROGRESS]: [State.REVIEW, State.TODO, State.CANCELLED],
    [State.REVIEW]:     [State.DONE, State.INPROGRESS],
    [State.DONE]:       [State.INPROGRESS],
    [State.CANCELLED]:  [State.TODO],
};

function isValidTransition(fromState, toState) {
    if (!fromState || !toState) return true;
    if (fromState === toState) return true;
    return (transitions[fromState] || []).includes(toState);
}

function getAllowedTransitions(fromState) {
    return transitions[fromState] || [];
}

module.exports = { isValidTransition, getAllowedTransitions };
