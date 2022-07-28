import React from "react";
import { Button, Grid } from "semantic-ui-react";
import { NftInfo } from "../App";
import MediaPreview from "./MediaPreview";

interface Props {
  nftInfo: NftInfo;
  onNext: () => void;
  media: any;
}

const ConfirmNFT = ({ nftInfo, onNext, media }: Props) => {
  return (
    <div>
      <div style={{ marginTop: 60 }} />
      <MediaPreview file={media} small={false}></MediaPreview>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 24, marginTop: 30 }}>{nftInfo.name}</div>
        <div style={{ fontSize: 16, marginTop: 30 }}>
          <b>Description</b>
        </div>
        <div style={{ fontSize: 14, marginTop: 6 }}>{nftInfo.description}</div>
        <div style={{ fontSize: 16, marginTop: 30 }}>
          <Grid columns={2}>
            {nftInfo.attributes.map((attribute) => {
              return (
                <Grid.Row style={{ paddingTop: 10 }}>
                  <Grid.Column>
                    <b>{attribute.trait_type}</b>
                  </Grid.Column>
                  <Grid.Column style={{ textAlign: "right" }}>
                    <span>{attribute.value}</span>
                  </Grid.Column>
                </Grid.Row>
              );
            })}
          </Grid>
        </div>
      </div>
      <Button
        fluid
        style={{
          marginTop: 60,
          background: "#037DD6",
          borderRadius: 100,
          color: "white",
          paddingBottom: 18,
          paddingTop: 18,
        }}
        onClick={onNext}
      >
        Confirm
      </Button>
    </div>
  );
};

export default ConfirmNFT;
