export interface BoardUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  order: number;
  columnId: string;
  dueDate: Date | string | null;
  storyPoints: number | null;
  assignee: BoardUser | null;
  labels: { label: { id: string; name: string; color: string } }[];
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  color: string;
  tasks: BoardTask[];
}
