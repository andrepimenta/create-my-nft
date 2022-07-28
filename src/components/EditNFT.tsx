import React from "react";
import { Button, Form, Icon, Popup } from "semantic-ui-react";
import { Attribute, NftInfo } from "../App";
import MediaInput from "./MediaInput";

interface Props {
  nftInfo: NftInfo;
  setNftInfo: any;
  onNext: () => void;
  media: any;
  setMedia: any;
}

const EditNFT = ({ nftInfo, setNftInfo, onNext, media, setMedia }: Props) => {
  const handleChange = (
    e: any,
    { name, value }: { name: string; value: string } | any,
    index: number | undefined = undefined
  ) => {
    if (index !== undefined) {
      return setNftInfo((nftInfo: NftInfo) => {
        const attributes = [...nftInfo.attributes];
        const attribute = attributes[index] as Attribute;
        if (name === "trait_type") attribute.trait_type = value;
        if (name === "value") attribute.value = value;
        return {
          ...nftInfo,
          attributes,
        };
      });
    }

    setNftInfo((nftInfo: NftInfo) => ({
      ...nftInfo,
      [name]: value,
    }));
  };

  const addAttribute = () => {
    setNftInfo((nftInfo: NftInfo) => ({
      ...nftInfo,
      attributes: [...nftInfo.attributes, { trait_type: "", value: "" }],
    }));
  };

  const next = () => {
    if(!nftInfo.name) return alert("Please insert the NFT name")
    if(!media) return alert("Please insert the NFT media")
    onNext()
  }

  return (
    <>
      <MediaInput media={media} setMedia={setMedia} />
      <div style={{ textAlign: "left", marginTop: 20 }}>
        <Form text-align="left">
          <Form.Group widths={"equal"}>
            <Form.Input
              fluid
              label="Name *"
              placeholder="What should we call your NFT?"
              onChange={handleChange}
              value={nftInfo.name}
              name="name"
            />
          </Form.Group>
          <Form.Group widths={"equal"}>
            <Form.TextArea
              label="Description"
              placeholder="This is how your NFT will be described"
              onChange={handleChange}
              value={nftInfo.description}
              name="description"
            />
          </Form.Group>
          <Form.Field style={{ marginBottom: 0 }}>
            <label>Attributes  <Popup header={"NFT Attributes"} content='Attributes help describe your NFT. They are public and will most often be shown along with your NFT.' pinned on={'click'} trigger={<Icon style={{color: 'gray'}} name="info circle"/>} /></label>
            
          </Form.Field>
          {nftInfo.attributes.map((attribute, index) => (
            <Form.Group
              unstackable
              widths={2}
              key={index}
              style={{ marginBottom: 14 }}
            >
              <Form.Input
                fluid
                placeholder="Type"
                name="trait_type"
                value={attribute.trait_type}
                onChange={(e: any, value: any) => handleChange(e, value, index)}
              />
              <Form.Input
                fluid
                placeholder="Value"
                name="value"
                value={attribute.value}
                onChange={(e: any, value: any) => handleChange(e, value, index)}
              />
            </Form.Group>
          ))}
          <div
            style={{
              color: "#037DD6",
              paddingTop: 5,
              paddingBottom: 10,
              paddingRight: 10,
              cursor: "pointer",
            }}
            onClick={addAttribute}
          >
            + Add attribute
          </div>
          <Button
            fluid
            style={{
              marginTop: 30,
              background: "#037DD6",
              borderRadius: 100,
              color: "white",
              paddingBottom: 18,
              paddingTop: 18,
            }}
            onClick={next}
          >
            Continue
          </Button>
        </Form>
      </div>
    </>
  );
};

export default EditNFT;
