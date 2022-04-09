// Farming (growing and harvesting crops)

//   - has a field that grows over time until becomes harvestable: ContructionType: 'FarmField'
//   - worker plants crops JobType: 'PlantingCrops'
//   - worker harvests crops when they are ready, producing [wheat] JobType: 'Harvesting' -(produces)-> 'Wheat'

// Construction FarmField
// output_factor: 10
// max_workers_per_process: 1
// max_processes: 1

// ProductionProcess Harvesting
// worker_ids: [Worker.id]
// hosting_target_id: FarmField
// input: FarmField
// output: Resource { type: 'Wheat', amount: FarmField.output_factor +/-10% }

// ProductionProcess<InputTypeArray>
// worker_ids: Entity[]
// hosting_target_id: Entity
// inputs: <InputTypeArray>
// outputs: Resource[]

// Harvesting
// (Farm, Workers, ProductionProcessState) -> { state: ProductionProcessState, output: Option<Resources> } // Resources if it finished producing
export {};

type Resource = { type: "Wheat"; amount: number };





type PhysicalItem = {};

type Construction = {};

type FarmField = {
  id: string;
  max_workers_per_process: number;
  max_processes: number;
  output_factor: number;
};

// let create_harvest = (farm_field: farmField) => {
//   {
//     worker_ids: [],
//     units_of_work: 0,
//     hosting_target_id: farm_field.id,
//   }
// }


// export let harvest = (
//   farm_field: FarmField,
//   workers: Worker[],
//   state: IncompleteWorkProcessState
// ): IncompleteWorkProcessState | CompleteWorkProcessState => {
//   let output_factor = farm_field.output_factor;

//   let work_done = workers
//     .map((x) => x.skills.find((s) => s.type == "Harvesting")?.performance ?? 0) // actually we will guarantee that there is a skill for each worker by having them all created in a constructor
//     .reduce((a, b) => a + b, 0);

//   let units_of_work_left = Math.max(state.units_of_work_left - work_done, 0);

//   if (units_of_work_left > 0) {
//     return { ...state, units_of_work_left };
//   } else {
//     let resource: Resource = {
//       type: "Wheat",
//       amount: output_factor * (1.0 + Math.random() * 0.1),
//     };

//     return {
//       hosting_target_id: state.hosting_target_id,
//       is_complete: true,
//       output: [resource],
//     };
//   }
// };

type CraftableItemBlueprint = {
  name: string;
  resources: Resource[];
};

type CraftableItem = {
  quality: number;
  weapon_blueprint: CraftableItemBlueprint;
};

// TODO: list blueprints: weapon, tool, armor, garment, ornament, construction

type CraftableToolOrWeapon = {};


