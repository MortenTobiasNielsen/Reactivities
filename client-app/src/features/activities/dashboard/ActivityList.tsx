import { observer } from "mobx-react-lite";
import React, { SyntheticEvent, useState } from "react";
import { Button, Item, Label, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default observer(function ActivityList() {
  const { activityStore } = useStore();
  const { activitiesByDate, deleting, deleteActivity, selectActivity } =
    activityStore;

  const [target, setTarget] = useState("");

  function handleActivityDelete(
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) {
    setTarget(event.currentTarget.name);
    deleteActivity(id);
  }

  return (
    <Segment>
      <Item.Group divided>
        {activitiesByDate.map((activity) => (
          <Item key={activity.id}>
            <Item.Content>
              <Item.Header as="a">{activity.title}</Item.Header>
              <Item.Meta>{activity.date}</Item.Meta>
              <Item.Description>
                <div>{activity.description}</div>
                <div>
                  {activity.city}, {activity.venue}{" "}
                </div>
              </Item.Description>
              <Item.Extra>
                <Button
                  onClick={() => selectActivity(activity.id)}
                  floated="right"
                  content="View"
                  color="blue"
                />
                <Button
                  name={activity.id}
                  onClick={(event) => handleActivityDelete(event, activity.id)}
                  loading={deleting && target === activity.id}
                  floated="right"
                  content="Delete"
                  color="red"
                />
                <Label basic content={activity.category} />
              </Item.Extra>
            </Item.Content>
          </Item>
        ))}
      </Item.Group>
    </Segment>
  );
});
