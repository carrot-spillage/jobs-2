import { useEffect, useRef, useState } from "preact/hooks";
import "./App.css";
import {
  create_job_generator,
  match_workers_with_jobs,
  Job,
  WorkProcess,
  join_or_create_work_process,
} from "./careful/activity";
import {
  advance_work_process_state,
  CompleteWorkProcessState,
  IncompleteWorkProcessState,
  Worker,
} from "./careful/advance_work_process";

type SimViewState = {
  jobs: Job[];
  workers: Worker[];
  job_priorities: Map<number, number>;
  jobless_worker_ids: number[];
  work_processes: WorkProcess[];
};

const initial_jobs: Job[] = [
  {
    id: 1,
    name: "PlantingCrops",
    skill_type: "PlantingCrops",
  },
  {
    id: 2,
    name: "Harvesting",
    skill_type: "Harvesting",
  },
  {
    id: 3,
    name: "Crafting",
    skill_type: "Crafting",
  },
];

const workers: Worker[] = new Array(30).fill(null).map(
  (_, id): Worker => ({
    id,
    fatigue: 0,
    skills: [
      { type: "PlantingCrops", value: Math.random() },
      { type: "Crafting", value: Math.random() },
      { type: "Harvesting", value: Math.random() },
    ],
  })
);

function App() {
  const [paused, setPaused] = useState(false);
  const [sim_view, setSimView] = useState<SimViewState>({
    jobs: initial_jobs,
    job_priorities: new Map(initial_jobs.map((x) => [x.id, 1])),
    workers,
    jobless_worker_ids: workers.map((x) => x.id),
    work_processes: [],
  });

  const [job_generator_jobs] = useState(sim_view.jobs);
  useEffect(() => {
    job_generator_jobs.forEach((x) => Object.assign(x, sim_view.jobs.find((y) => y.id === x.id)!));
  }, [sim_view.jobs]);
  const [job_generator] = useState(() => create_job_generator(job_generator_jobs, sim_view.job_priorities));

  useInterval(() => {
    if (paused) return;
    let new_state = sim_view;

    let updated_work_processes = new_state.work_processes.map((wp) => ({
      ...wp,
      state: advance_work_process_state(
        new_state.workers.filter((w) => wp.worker_ids.includes(w.id)),
        wp.state,
        new_state.jobs.find((j) => j.id === wp.job_id)!.skill_type,
        1
      ),
    }));

    new_state = update_state_with_work_process_results(new_state, updated_work_processes);

    // assigning new workers to jobs

    const workers_with_jobs = match_workers_with_jobs(
      new_state.workers.filter((x) => new_state.jobless_worker_ids.includes(x.id)),
      job_generator
    );

    new_state = {
      ...new_state,
      jobless_worker_ids: [],
    };

    const results = workers_with_jobs.reduce(
      ({ work_processes, assigned_worker_ids }, wj) => {
        let { updated_work_processes, worker } = join_or_create_work_process(wj.worker, wj.job, work_processes);
        return {
          work_processes: updated_work_processes,
          assigned_worker_ids: [...assigned_worker_ids, worker.id],
        };
      },
      {
        work_processes: new_state.work_processes,
        assigned_worker_ids: [] as number[],
      }
    );

    new_state = update_state_with_job_results(new_state, results.work_processes, results.assigned_worker_ids);

    // TODO: update fatigue
    setSimView(new_state);
  }, 500);

  return (
    <div>
      <button style={{ margin: "8px 0" }} onClick={() => setPaused((x) => !x)}>
        {paused ? "Play" : "Pause"}
      </button>
      <SimView value={sim_view} onChange={setSimView} />
    </div>
  );
}

function SimView({
  value: { jobs, work_processes, workers, job_priorities },
  onChange,
}: {
  value: SimViewState;
  onChange: (value: SimViewState | ((prevState: SimViewState) => SimViewState)) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 24 }}>
      {jobs.map((j) => (
        <div style={{ flex: 1 }}>
          <JobBar
            job={j}
            priority={job_priorities.get(j.id)!}
            onChangePriority={(priority) => {
              job_priorities.set(j.id, priority); // NOTE: mutation
              onChange((state) => ({
                ...state,
                job_priorities,
              }));
            }}
          />

          {work_processes
            .filter((x) => x.job_id === j.id)
            .map((x) => (
              <WorkProcessesRow
                id={x.id}
                state={x.state}
                units_of_work={x.units_of_work}
                workers={workers.filter((w) => x.worker_ids.includes(w.id))}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

function JobBar({
  job,
  priority,
  onChangePriority,
}: {
  job: Job;
  priority: number;
  onChangePriority: (priority: number) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>
        {job.name}: {priority}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.1}
        onChange={(x) => onChangePriority(x.currentTarget.valueAsNumber)}
      />
    </div>
  );
}

function WorkProcessesRow({
  state,
  workers,
  units_of_work,
  id,
}: {
  state: IncompleteWorkProcessState;
  workers: Worker[];
  units_of_work: number;
  id: number;
}) {
  return (
    <div>
      <span title={JSON.stringify(state.work_chunks)} style={{ fontSize: 10 }}>
        #{id}
      </span>
      <div>
        {workers.map((x) => (
          <span style={{ fontSize: 20 }}>🧍</span>
        ))}
      </div>
      <div
        style={{
          border: "0px solid #ccc",
          background: `#ccc`,
          width: "100%",
          height: 20,
          position: "relative",
        }}
      >
        <div>
          {state.work_chunks.map((x) => (
            <span
              title={JSON.stringify(x)}
              style={{
                border: "0px solid #bbb",
                background: `hsl(${Math.round(x.quality * 100)}, 100%, 74%)`,
                width: `${(x.units_of_work / units_of_work) * 100}%`,
                height: 20,
                display: "inline-block",
              }}
            ></span>
          ))}
        </div>
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            padding: "2px 4px",
            fontSize: 14,
          }}
        >
          {(((units_of_work - state.units_of_work_left) / units_of_work) * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function useInterval(callback: () => void, delay = 100) {
  const savedCallback = useRef<typeof callback>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default App;

function update_state_with_job_results(
  sim_view: SimViewState,
  work_processes: WorkProcess[],
  assigned_worker_ids: number[]
): SimViewState {
  return {
    ...sim_view,
    jobless_worker_ids: sim_view.jobless_worker_ids.filter(
      (jobless_worker_id) => !assigned_worker_ids.includes(jobless_worker_id)
    ),
    work_processes: work_processes,
  };
}

function update_state_with_work_process_results(
  sim_view: SimViewState,
  updated_work_processes: (Omit<WorkProcess, "state"> & {
    state: IncompleteWorkProcessState | CompleteWorkProcessState;
  })[]
): SimViewState {
  const new_jobless_worker_ids = updated_work_processes.filter((x) => x.state.is_complete).flatMap((x) => x.worker_ids);
  return {
    ...sim_view,
    work_processes: updated_work_processes.filter((x) => !x.state.is_complete) as WorkProcess[],
    jobless_worker_ids: [...sim_view.jobless_worker_ids, ...new_jobless_worker_ids],
  };
}
