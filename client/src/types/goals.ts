export interface Step {
  id: string;
  description: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  completed: boolean;
  steps: Step[];
}
