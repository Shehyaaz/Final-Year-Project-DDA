import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
	/*css to style the button*/
	background-color: ${props => props.color};
	margin-bottom: 1rem;
    border: none;
    border-radies: 8px;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 1rem;
    width: 100%;
`;

const FileUpload = props => {
  const hiddenFileInput = React.useRef(null);
  
  const handleClick = event => {
    hiddenFileInput.current.click();
  };
  const handleChange = event => {
    const fileUploaded = event.target.files[0];
    props.handleFile(fileUploaded);
  };
  return (
    <>
      <Button color={props.color} onClick={handleClick}>
        {props.label}
      </Button>
      <input type="file"
             ref={hiddenFileInput}
             onChange={handleChange}
             style={{display:'none'}} 
      /> 
    </>
  );
};
export default FileUpload;
