import React from "react";
import MediaPreview from "./MediaPreview";
import { useDropzone } from "react-dropzone";
import { Container } from "semantic-ui-react";

function MediaInput({ media, setMedia }: any) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,video/*,camera",
    maxFiles: 1,
    multiple: false,
    onDrop: (acceptedFiles) => {
      setMedia(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )[0]
      );
    },
  });

  return (
    <section className="container">
      {media ? (
        <MediaPreview file={media} small={false} />
      ) : (
        <div
          {...getRootProps({ className: "dropzone" })}
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #EAF6FF 100%)",
            border: "2px dashed #037DD6",
            borderRadius: 6,
            paddingTop: 85,
            paddingBottom: 85,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            color: "#037DD6",
          }}
        >
          <input {...getInputProps()} />
          <Container textAlign="center">
            Take a photo, video or select from your device's media.
          </Container>
        </div>
      )}
    </section>
  );
}

export default MediaInput;
