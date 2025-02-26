import Counter from "./counterModel.js";

export async function getNextCounterValue(counterName, session) {
    const result = await Counter.findByIdAndUpdate(counterName,
        {$inc: {counterValue: 1}},
        {new: true, session: session}
    );
    return result.counterValue;
}

export async function initializeCounters() {
    const counters = ['solutionCounter', 'elementCounter'];
    for (const counterId of counters) {
        const counter = await Counter.findById(counterId);
        if (!counter) {
            const newCounter = new Counter({_id: counterId, counterValue: 0});
            await newCounter.save();
        }
    }
}