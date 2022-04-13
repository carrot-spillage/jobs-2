let last_id = 1;

export let new_id = () => {
  last_id++;
  return last_id;
};
