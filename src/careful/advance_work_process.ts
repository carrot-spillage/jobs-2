export type Entity = number;

type QualityCounter = {
  points: number;
  instances: number;
};

export type IncompleteWorkProcessState = {
  is_complete: false;
  units_of_work_left: number;
  quality_counter: QualityCounter;
  work_chunks: WorkChunk[];
};

export type CompleteWorkProcessState = {
  is_complete: true;
  quality: number;
};

export type SkillType = "PlantingCrops" | "Harvesting" | "Crafting";

type Skill = { type: SkillType; value: number };

export type Worker = {
  id: Entity;
  fatigue: number;
  skills: Skill[];
};

export let advance_work_process_state = (
  workers: Worker[],
  state: IncompleteWorkProcessState,
  skill_type: SkillType,
  interval: number
): IncompleteWorkProcessState | CompleteWorkProcessState => {
  let work_chunks = calc_work_chunks(workers, skill_type);

  let progress = calc_work_chunks_progress(work_chunks, interval);
  let units_of_work_left = Math.max(state.units_of_work_left - progress, 0);

  let quality_counter = {
    instances: state.quality_counter.instances + work_chunks.length,
    points: state.quality_counter.points + calc_work_chunks_quality(work_chunks, interval),
  };

  if (units_of_work_left > 0) {
    return {
      ...state,
      units_of_work_left,
      quality_counter,
      work_chunks: [...state.work_chunks, ...work_chunks],
    };
  } else {
    return {
      quality: quality_counter.points / quality_counter.instances,
      is_complete: true,
    };
  }
};

let get_skill_value = (worker: Worker, skill_type: string) =>
  worker.skills.find((s) => s.type == skill_type)?.value ?? 0;

type WorkChunk = {
  quality: number;
  units_of_work: number;
}; // quality and progress go from 0.0 to 1.0

function calc_work_chunks(workers: Worker[], skill_type: string): WorkChunk[] {
  return workers.map((x) => get_skill_value(x, skill_type)).map((x) => ({ units_of_work: 0.5 + x / 2, quality: x }));
}

function calc_work_chunks_quality(worker_chunks: WorkChunk[], interval: number): number {
  return worker_chunks.map((x) => x.quality * interval).reduce((a, b) => a + b, 0);
}

function calc_work_chunks_progress(worker_chunks: WorkChunk[], interval: number): number {
  return worker_chunks.reduce((acc, x) => acc + x.units_of_work, 0) * interval;
}
