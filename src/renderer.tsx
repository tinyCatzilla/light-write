import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createEditor, Editor, BaseEditor, Text, Transforms, Range, Descendant } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, useSlate } from 'slate-react';


type CustomElement = {
  type: 'paragraph' | 'code';
  children: CustomText[];
};

type CustomText = {
  text: string;
  font?: string;
  size?: string;
  color?: string;
  bold?: boolean;
  underline?: boolean;
};
declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.', font: 'Arial', size: '16px', color: '#000000', bold: false, underline: false}],
  },
];

const DefaultElement = (props: RenderElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const CodeElement = (props: RenderElementProps) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const FontFamilyDropdown = () => {
  const editor = useSlate();
  const [font, setFont] = useState('Arial');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = event.target.value;
    setFont(newFont);

    if (editor.selection) {
      Editor.addMark(editor, 'font', newFont);
    }
  };

  useEffect(() => {
    if (editor.selection) {
      const marks = Editor.marks(editor);
      if (marks && marks.font) {
        setFont(marks.font);
      }
    }
  }, [editor.selection]);

  return (
    <select value={font} onChange={handleChange}>
      <option value="Arial">Arial</option>
      <option value="Verdana">Verdana</option>
      <option value="Courier New">Courier New</option>
      <option value="Georgia">Georgia</option>
      <option value="Times New Roman">Times New Roman</option>
    </select>
  );
};

const FontSizeDropdown = () => {
  const editor = useSlate();
  const [size, setSize] = useState('16px');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = event.target.value;
    setSize(newSize);

    if (editor.selection) {
      Editor.addMark(editor, 'size', newSize);
    }
  };

  useEffect(() => {
    if (editor.selection) {
      const marks = Editor.marks(editor);
      if (marks && marks.size) {
        setSize(marks.size);
      }
    }
  }, [editor.selection]);

  return (
    <select value={size} onChange={handleChange}>
      <option value="12px">12</option>
      <option value="16px">16</option>
      <option value="20px">20</option>
      <option value="24px">24</option>
      <option value="28px">28</option>
    </select>
  );
};

const TextColorButton = () => {
  const editor = useSlate();
  const [color, setColor] = useState('#000000');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setColor(newColor);

    if (editor.selection) {
      Editor.addMark(editor, 'color', newColor);
    }
  };

  useEffect(() => {
    if (editor.selection) {
      const marks = Editor.marks(editor);
      if (marks && marks.color) {
        setColor(marks.color);
      }
    }
  }, [editor.selection]);

  return <input type="color" value={color} onChange={handleChange} />;
};


const BoldButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isBold = marks ? marks.bold === true : false;
    Editor.addMark(editor, 'bold', !isBold);
  };

  return <button onMouseDown={handleClick}>Bold</button>;
};


const UnderlineButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isUnderline = marks ? marks.underline === true : false;
    Editor.addMark(editor, 'underline', !isUnderline);
  };

  return <button onMouseDown={handleClick}>Underline</button>;
};

const App: React.FC = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { attributes, children, leaf } = props;

    if (leaf.font) {
      children = <span style={{ fontFamily: leaf.font }}>{children}</span>;
    }

    if (leaf.color) {
      children = <span style={{ color: leaf.color }}>{children}</span>;
    }

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.size) {
      children = <span style={{ fontSize: leaf.size }}>{children}</span>;
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!editor.selection) return;
      const [leaf] = Editor.leaf(editor, editor.selection);

      // Handle 'bold' keyboard shortcut
      if (event.key === 'b' && event.ctrlKey) {
        event.preventDefault();
        const marks = Editor.marks(editor);
        const isBold = marks ? marks.bold === true : false;
        Editor.addMark(editor, 'bold', !isBold);
      }

      // Handle 'underline' keyboard shortcut
      else if (event.key === 'u' && event.ctrlKey) {
        event.preventDefault();
        const marks = Editor.marks(editor);
        const isUnderline = marks ? marks.underline === true : false;
        Editor.addMark(editor, 'underline', !isUnderline);
      }

      // // Handle 'code' keyboard shortcut
      // else if (event.key === '`' && event.ctrlKey) {
      //   event.preventDefault();
      //   const [match] = Editor.nodes(editor, {
      //     match: n => n.type === 'code',
      //   });
      //   Transforms.setNodes(
      //     editor,
      //     { type: 'code' },
      //     { match: n => Editor.isBlock(editor, n) }
      //   );
      // }
    },
    [editor]
  );

  return (
    <div>
      <Slate editor={editor} initialValue={value} onChange={setValue}>
        <div>
          <FontFamilyDropdown/>
          <FontSizeDropdown/>
          <TextColorButton />
          <BoldButton />
          <UnderlineButton />
        </div>
        <Editable
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={handleKeyDown}
        />
      </Slate>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
