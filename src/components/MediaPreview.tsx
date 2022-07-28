import React from "react";
import { Image } from "semantic-ui-react";

const MediaPreview = ({
  file,
  small = false,
}: {
  file: any;
  small: boolean;
}) => {
  return file.type.startsWith("video") ? (
    <video
      width={"100%"}
      style={{ maxHeight: small ? 150 : 300, borderRadius: 10 }}
      controls
      preload="metadata"
      autoPlay
      webkit-playsinline
      playsInline
    >
      <source src={file.preview} type={file.type} />
      Your browser does not support the video tag.
    </video>
  ) : (
    <Image
      src={file.preview}
      style={{ maxHeight: small ? 150 : 300, borderRadius: 10 }}
    />
  );
};

export default MediaPreview;
