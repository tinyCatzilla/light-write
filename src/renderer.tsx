import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createEditor, Editor, Text, Descendant } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, useSlate } from 'slate-react';
import { latexMathToHtml } from './mathToHTML';
import Split from 'react-split'
// import { ipcRenderer } from 'electron';
import './style.css';
import './themes/light.css';


declare global {
  interface Window { electron: any; }
}

window.electron.onThemeChange((event: any, theme: any) => {
  applyTheme(theme);
});

let textColor = '#000000';

async function applyTheme(theme: string) {
  let themeStyles = document.querySelector<HTMLStyleElement>('#theme-stylesheet');
  if(themeStyles){
    switch (theme) {
      case 'default':
        themeStyles.innerText = await fetch('./src/themes/light.css').then(res => res.text());
        textColor = '#000000';
        break;
      case 'dark':
        themeStyles.innerText = await fetch('./src/themes/dark.css').then(res => res.text());
        textColor = '#ffffff';
        break;
      case 'orange':
        themeStyles.innerText = await fetch('./src/themes/orange.css').then(res => res.text());
        textColor = '#000000';
        break;
    }
  } else {
    console.error("Cannot find element with id 'theme-stylesheet'");
  }
}


type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomText = {
  text: string;
  code?: boolean;
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
    children: [{ text: String.raw`I love LaTeX!! $\int_0^1 \Gamma^{(\alpha-1)}(x)$`, font: 'Arial', size: '16px', color: textColor, bold: false, underline: false}],
  },
];

const DefaultElement = (props: RenderElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};


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
  const [color, setColor] = useState(textColor);

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

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-bold"></i>
  </button>;
};


const UnderlineButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isUnderline = marks ? marks.underline === true : false;
    Editor.addMark(editor, 'underline', !isUnderline);
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-underline"></i></button>;
};

const InlineCodeButton = () => {
  const editor = useSlate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const marks = Editor.marks(editor);
    const isCode = marks ? marks.code === true : false;
    Editor.addMark(editor, 'code', !isCode);
  };

  return <button className="toolbarBtn" onMouseDown={handleClick}><i className="fa-solid fa-code"></i></button>;
};

const serializeHTML = (nodes: Descendant[]): string => {
  let html = '';
  for (let node of nodes) {
    if (Text.isText(node)) {
      let span = node.text;

      // // Check if text contains inline LaTeX
      // if (/\$(.*?)\$/.test(span)) {
      //   span = span.replace(/\$(.*?)\$/g, (match, latex) => {
      //     return latexMathToHtml(`$${latex}$`);
      //   });
      // }

      // // Check if text contains display LaTeX
      // if (/\$\$(.*?)\$\$/.test(span)) {
      //   span = span.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
      //     return latexMathToHtml(`$${latex}$`);
      //   });
      // }

      // Check if text contains display LaTeX
      if (/\$\$(.*?)\$\$/.test(span)) {
        span = span.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
          return latexMathToHtml(`$$${latex}$$`);
        });
      }

      // Check if text contains inline LaTeX
      if (/\$(.*?)\$/.test(span)) {
        span = span.replace(/\$(.*?)\$/g, (match, latex) => {
          return latexMathToHtml(`$${latex}$`);
        });
      }


      
      if (node.bold) {
        span = `<strong>${span}</strong>`;
      }
      if (node.underline) {
        span = `<u>${span}</u>`;
      }
      if (node.code) {
        span = `<code>${span}</code>`;
      }
      if (node.font) {
        span = `<span style="font-family: ${node.font}">${span}</span>`;
      }
      if (node.size) {
        span = `<span style="font-size: ${node.size}">${span}</span>`;
      }
      if (node.color) {
        span = `<span style="color: ${node.color}">${span}</span>`;
      }
      html += span;
    } else if ('children' in node) {
      html += `<p>${serializeHTML(node.children)}</p>`;
    }
  }
  return html;
};


const App: React.FC = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);

  const renderElement = useCallback((props: RenderElementProps) => {
    return <DefaultElement {...props} />;
  }, []);  

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { attributes, children, leaf } = props;

    if (leaf.code) {
      children = <code style={{ backgroundColor: '#f8f8f8', fontFamily: 'Courier New' }}>{children}</code>;
    }    

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
      // const [leaf] = Editor.leaf(editor, editor.selection);

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

      // Handle 'code' keyboard shortcut
      else if (event.key === '`' && event.ctrlKey) {
        event.preventDefault();
        const marks = Editor.marks(editor);
        const isCode = marks ? marks.code === true : false;
        Editor.addMark(editor, 'code', !isCode);
      }
    },
    [editor]
  );

  return (
    <div className="app-container">
      <Split 
        className="split"
        minSize={200}
      >
        <div className="edit-container">
          <Slate editor={editor} initialValue={value} onChange={setValue}>
            <div className = "toolbar">
              <FontFamilyDropdown/>
              <FontSizeDropdown/>
              <TextColorButton />
              <BoldButton />
              <UnderlineButton />
              <InlineCodeButton />
            </div>
            <Editable
              className="slate-editor"
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              onKeyDown={handleKeyDown}
            />
          </Slate>
        </div>
        <div className="preview-container">
          <div className="preview-box">
            <h2>Preview</h2>
            <div dangerouslySetInnerHTML = {{ __html: serializeHTML(value) }} />
          </div>
        </div>
      </Split>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
