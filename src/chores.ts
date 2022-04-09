// - Woodcutting
// - Gathering items
// - Constructing
// - Crafting
// - Farming
// - Scouting
// - Mining Ore
// - Researching spells
// - Learning spells
// - Training
// - Upskilling (better tree cutting/crafting, mining etc)

// Jobs prioritisation:
// Probability 0 to 1
// Change probability of a worker being assigned to this job to X%
// Every Job has N mount of job-specific units of work.
// Every job has maximum number of people participating

// Worker has performance per each job type (a unit of work takes X game frames).
// Worker reassignment happens ever N units of work (set per each job type)

// Job kinds
// has an "outcome"
// - Changes parameters (ImprovingSoil - farm growth performance)
// - Produces items: (Harvesting - crops), (Woodcutting - wood), (Crafting - armour/weapons), (SpellReseach - spell) (Constructing - building) (MiningOre - ore)
// - Navigation: delivery, scouting, going to a target (job.target_id)

// Worker [+ Resources] -> Navigating -> Working
// If worker is destroyed -> drop items
// If target of navigation is destroyed -> drop item + find another job

// When looking for a job find incomplete/abandoned processes for this work type that it can participate in


type Worker = { id: string; name: string };

export type JobType = "TreeCutting" | "Building" | "Mining" | "PlantingCrops" | "Harvesting" | "Gathering" | "Crafting";

export type ConstructionType = "FarmField" | "House" | "Mine" | "Workshop";

type Job = { units_of_work_left: number; job_type: JobType };

type Tree = { id: string; jobs: Job[] };

type FarmField = { id: string; jobs: Job[] };

const tree: Tree = {
  id: "tree123",
  jobs: [
    { units_of_work_left: 2.4, job_type: "TreeCutting" },
  ],
};

const farmField: FarmField = {
  id: "farmField123",
  jobs: [{ units_of_work_left: 0.7, job_type: "PlantingCrops" }],
};

type WorkerAssignment = {
  job_type: JobType;
  target_id: string;
  worker_id: string;
};

const worker = { id: "123", name: "Must Eaterson" };

const assignments: WorkerAssignment[] = [
  { job_type: "PlantingCrops", target_id: farmField.id,  worker_id: worker.id },
];

type JobProcess = {
  job_type: string;
  resources_provoded: Resources[];
  resources_needed: Resource[];
  max_participants: number;
  participant_ids: Entity[];
  remaining_work: number;
}

export {};


/*
There is a designated stockpile area near the campfire (center of the settlement), that doesn't allow building or any vegetation on it

Farming (growing and harvesting crops)

  - has a field that grows over time until becomes harvestable
  - worker plants crops
  - worker harvests crops when they are ready, producing [wheat]

Woodcutting

  - choose the nearest tree
  - cut the tree (drops resource [wood])
  [raise event that a resource is available for collection]
  // ineffective- as initially there would only be 1 tree to carry

Gathering items
  - gather anything according to priorities
  - bring to the stockpile

  // should we mark every item we produce as "ours" and raise event [item produced]?

Constructing
  - each construction site has a building type, resources, max people building at the same time, and units of work
  - we can only start building if we have all of the resources (we can do partials, not sure if that is much harder to impl)
  - when construction is complete we could raise an event [building complete]
  - building types so far: Farm, House, Workshop, Mine

Crafting
  - to craft we need a workshop
  - workshop has slots for max items to be crafted at the same time
  - each item has units of work to complete

Mining [Ore, Gems]
  - to mine we need a Mine
  - Can only be built where the resource is located
  - worker will stay in the building until it yields the resource (a production process) Process requires random units of work within range (-0.15x;+ 0.15x)

Produced items and resources end up being stored in the buildings they were produced in until they are gathered. There is a limit on how many of them can be stored. They need to be moved to the stockpile before they are counted as "ready for use"
 */
// - Scouting
// - Researching spells
// - Learning spells
// - Training

// - Upskilling (better tree cutting/crafting, mining etc)