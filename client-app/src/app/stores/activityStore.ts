import { makeAutoObservable, runInAction } from "mobx";
import { v4 as uuid } from "uuid";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { format } from "date-fns";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode: boolean = false;
  loadingActivities: boolean = false;
  creatingOrEditing: boolean = false;
  deleting: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, "yyyy-MM-dd");
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [Key: string]: Activity[] })
    );
  }

  loadActivities = async () => {
    this.setLoadingActivities(true);
    try {
      const activities = await agent.Activities.list();
      activities.forEach((activity) => {
        this.setActivity(activity);
      });
      this.setLoadingActivities(false);
    } catch (error) {
      console.log(error);
      this.setLoadingActivities(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.setLoadingActivities(true);
      try {
        const activity = await agent.Activities.details(id);
        this.setActivity(activity);

        runInAction(() => {
          this.selectedActivity = activity;
        });
        this.setLoadingActivities(false);

        return activity;
      } catch (error) {
        console.log(error);
        this.setLoadingActivities(false);
      }
    }
  };

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  private setActivity = (activity: Activity) => {
    activity.date = new Date(activity.date!);
    this.activityRegistry.set(activity.id, activity);
  };

  setLoadingActivities = (state: boolean) => {
    this.loadingActivities = state;
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
