export interface GoalDTO {
    _id: string;
    name: string;
    creatorId: string;
    __v: number;
    steps: StepDTO[];
  }
  
  export interface StepDTO {
    _id: string;
    description: string;
    completed: boolean;
    goal: GoalReferenceDTO | string;
    __v: number;
  }

  export interface GoalReferenceDTO {
    _id: string;
    name: string;
    creatorId: string;
    __v: number;
    id: string;
  }
  