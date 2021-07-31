import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityFilters from "./ActivityFilters";
import ActivityList from "./ActivityList";

export default observer(function ActivityDashboard() {
  const { activityStore } = useStore();
  const { activityRegistry, loadingActivities, loadActivities } = activityStore;

  useEffect(() => {
    if (activityRegistry.size < 2) loadActivities();
  }, [activityRegistry.size, loadActivities]);

  if (loadingActivities) {
    return <LoadingComponent content="Loading Activities..." />;
  }

  return (
    <Grid>
      <Grid.Column width="10">
        <ActivityList />
      </Grid.Column>
      <Grid.Column width="6">
        <ActivityFilters />
      </Grid.Column>
    </Grid>
  );
});
