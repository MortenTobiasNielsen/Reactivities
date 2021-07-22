import { makeAutoObservable, runInAction } from "mobx";
import { v4 as uuid } from "uuid";
import agent from "../api/agent";
import { Activity } from "../models/activity";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode: boolean = false;
  loadingActivities: boolean = true;
  creatingOrEditing: boolean = false;
  deleting: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  loadActivities = async () => {
    try {
      const activities = await agent.Activities.list();
      activities.forEach((activity) => {
        activity.date = activity.date.split("T")[0];
        this.activityRegistry.set(activity.id, activity);
      });
      this.setLoadingActivities(false);
    } catch (error) {
      console.log(error);
      this.setLoadingActivities(false);
    }
  };

  setLoadingActivities = (state: boolean) => {
    this.loadingActivities = state;
  };

  selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
  };

  cancelSelectedActivity = () => {
    this.selectedActivity = undefined;
  };

  openForm = (id?: string) => {
    id ? this.selectActivity(id) : this.cancelSelectedActivity();
    this.editMode = true;
  };

  closeForm = () => {
    this.editMode = false;
  };

  createActivity = async (activity: Activity) => {
    this.creatingOrEditing = true;
    activity.id = uuid();

    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.creatingOrEditing = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.creatingOrEditing = false;
      });
    }
  };

  updateActivity = async (activity: Activity) => {
    this.creatingOrEditing = true;

    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
        this.creatingOrEditing = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.creatingOrEditing = false;
      });
    }
  };

  deleteActivity = async (id: string) => {
    this.deleting = true;

    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
        if (this.selectedActivity?.id === id) this.cancelSelectedActivity();
        this.deleting = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.deleting = false;
      });
    }
  };
}
