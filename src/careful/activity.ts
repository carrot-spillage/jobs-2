import {
  advance_work_process_state,
  Entity,
  IncompleteWorkProcessState,
  SkillType,
  Worker,
} from "./advance_work_process";

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

function can_keep_resting(interval: number, fatigue: number, quality_of_rest: number): ActivityUpdate {
  fatigue -= interval * default_resting_speed * quality_of_rest;
  if (fatigue <= 0) {
    return { fatigue: 0, is_finished: true };
  }

  return { fatigue, is_finished: false };
}

function update_work_process(
  workers: Worker[],
  state: IncompleteWorkProcessState,
  skill_type: SkillType,
  interval: number
) {
  if (workers.some((x) => x.fatigue >= 1)) {
    throw new Error("We must never get tired workers here");
  }

  const new_state = advance_work_process_state(workers, state, skill_type, interval);

  let tired_workers = workers.filter((x) => x.fatigue >= 1);
  return {
    state: new_state,
    tired_workers,
  };
}

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
