import {
  advance_work_process_state,
  Entity,
  IncompleteWorkProcessState,
  SkillType,
  Worker,
} from "./advance_work_process";
import { new_id } from "./new_id";

type ActivityUpdate = {
  fatigue: number;
  is_finished: boolean;
};

let default_resting_speed = 0.001; // default_resting_speed = intervals for 8 game hours
let default_tiredness_speed = 0.001;

function can_keep_working(interval: number, fatigue: number): ActivityUpdate {
  fatigue += interval * default_tiredness_speed;
  if (fatigue >= 1) {
    return { fatigue: 1, is_finished: true };
  }

  return { fatigue, is_finished: false };
}

// function can_keep_resting(interval: number, fatigue: number, quality_of_rest: number): ActivityUpdate {
//   fatigue -= interval * default_resting_speed * quality_of_rest;
//   if (fatigue <= 0) {
//     return { fatigue: 0, is_finished: true };
//   }

//   return { fatigue, is_finished: false };
// }

// function update_work_process(
//   workers: Worker[],
//   state: IncompleteWorkProcessState,
//   skill_type: SkillType,
//   interval: number
// ) {
//   if (workers.some((x) => x.fatigue >= 1)) {
//     throw new Error("We must never get tired workers here");
//   }

//   const new_state = advance_work_process_state(workers, state, skill_type, interval);

//   let tired_workers = workers.filter((x) => x.fatigue >= 1);
//   return {
//     state: new_state,
//     tired_workers,
//   };
// }

export type Job = {
  id: Entity;
  name: string;
  skill_type: SkillType;
};

export function* create_job_generator(jobs: Job[], job_priorities: Map<number, number>): Iterator<Job, Job> {
  let counter = 0;
  let accumulated_value_per_job = new Map<Entity, number>();
  while (true) {
    let job = jobs[counter];

    let acc_value = (accumulated_value_per_job.get(job.id) ?? 0) + job_priorities.get(job.id)!;

    if (acc_value >= 1) {
      yield job;
      acc_value -= 1;
    }

    accumulated_value_per_job.set(job.id, acc_value);
    counter++;

    if (counter >= jobs.length) {
      counter = 0;
    }
  }
}

export function match_workers_with_jobs(workers_looking_for_jobs: Worker[], job_queue: Iterator<Job, Job>) {
  let workers = workers_looking_for_jobs;
  let workers_with_jobs: { worker: Worker; job: Job }[] = [];
  while (workers.length > 0) {
    let job = job_queue.next().value;
    let new_workers = sort_workers_by_skill(workers_looking_for_jobs, job.skill_type);
    let top_worker = new_workers.pop()!;
    workers = new_workers;
    workers_with_jobs.push({ worker: top_worker, job });
  }
  return workers_with_jobs;
}

function sort_workers_by_skill(workers: Worker[], skill_type: SkillType) {
  return workers.sort(
    (a, b) => b.skills.find((x) => x.type === skill_type)!.value - a.skills.find((x) => x.type === skill_type)!.value
  );
}

export function join_or_create_work_process(
  worker: Worker,
  job: Job,
  available_work_processess: WorkProcess[]
): JoinOrCreateWorkProcessResult {
  let available_process_index = available_work_processess.findIndex(
    (x) => x.max_workers > x.worker_ids.length + x.tentative_worker_ids.length && job.id === x.job_id
  );

  if (available_process_index >= 0) {
    return {
      type: "joined",
      worker,
      updated_work_processes: available_work_processess.map((x, i) =>
        i === available_process_index ? join_work_process(x, worker) : x
      ),
    };
  } else {
    return {
      type: "created",
      worker,
      updated_work_processes: [...available_work_processess, create_work_process(worker, job)],
    };
  }
}

function join_work_process(work_process: WorkProcess, worker: Worker): WorkProcess {
  return {
    ...work_process,
    tentative_worker_ids: [...work_process.tentative_worker_ids, worker.id],
  };
}

function create_work_process(worker: Worker, job: Job): WorkProcess {
  const units_of_work = 10; // TODO: make this configurable
  return {
    id: new_id(),
    job_id: job.id,
    max_workers: job.name === "Harvesting" ? 2 : 1, // TODO: make this configurable
    state: {
      is_complete: false,
      quality_counter: { instances: 0, points: 0 },
      units_of_work_left: units_of_work,
      work_chunks: [],
    },
    units_of_work,
    tentative_worker_ids: [worker.id],
    worker_ids: [],
  };
}

export type WorkProcess = {
  id: number;
  units_of_work: number;
  job_id: number;
  max_workers: number;

  state: IncompleteWorkProcessState;
  worker_ids: number[];
  tentative_worker_ids: number[];
};

export type JoinOrCreateWorkProcessResult = {
  type: "joined" | "created";
  worker: Worker;
  updated_work_processes: WorkProcess[];
};
