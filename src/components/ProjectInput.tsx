import InputCustom from "@/components/InputCustom";

type Props = {
    index: number;
    project_title: string;
    project_description: string;
    project_photo_path: string;
    endpoint: string;
}

export default function ProjectInput({index, project_title, project_description, project_photo_path, endpoint}: Props) {
    endpoint += `/project/${index}`;
    return (
        <>
            <InputCustom
              componentName={"project_title"}
              displayName={"Titre du projet"}
              currentValue={project_title}
              endpoint={endpoint}
            />
            <InputCustom
              componentName={"project_description"}
              displayName={"Description du projet"}
              currentValue={project_description}
              endpoint={endpoint}
              type={"textarea"}
            />
        </>
    );
}