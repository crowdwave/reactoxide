import React from 'react';
import {DefaultSplitter, Split, RenderSplitterProps} from '@geoffcox/react-splitter';
import {VerticalStripedSplitter, HorizontalStripedSplitter, SolidSplitter} from './CustomSplitters';
import TestShadow from './TestShadow';
import ShadowDom from './ShadowDom';
import EventEmitter from "eventemitter3";
import {MultiFileEditor} from "./editor/MultiFileEditor"

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

const App = ({emitter}: Props) => {
    const [getOpenFiles, setOpenFiles] = React.useState<string[]>([])

    return (
        <>
            <style>
                {`
                    .wrapper {
                      display: grid;
                      grid-template-columns: 1fr;
                      grid-template-rows: auto 1fr auto;
                      gap: 0px 0px;
                      grid-auto-flow: row;
                      grid-template-areas:
                        "top"
                        "middle"
                        "bottom";
                      width: 100%;
                      height: 100%;
                    }
                    
                    .top { 
                            grid-area: top; 
                            padding: 12px; 
                            border-bottom: 3px solid #474757; 
                            }

                    .middle { 
                            grid-area: middle; 
                            }

                    .bottom { 
                            grid-area: bottom;  
                            padding: 12px;
                            border-top: 3px solid #474757; 
                            }
                `}
            </style>

            <div className="wrapper">
                <div className="top" style={{"fontSize": "2em"}}>React OxIDE</div>
                <div className="middle App" style={{"backgroundColor": "#262731"}}>
                    <Split
                        renderSplitter={() => <SolidSplitter/>}
                        initialPrimarySize='30%'
                        splitterSize='10px'
                    >
                        <div style={{"height": "100%", "overflowY": "scroll"}}>
                            <ShadowDom>
                                <div style={{"padding": "10px"}}>
                                    <TestShadow emitter={emitter}/>
                                </div>
                            </ShadowDom>
                        </div>
                        <Split
                            renderSplitter={() => <SolidSplitter color="#474757"/>}
                            splitterSize='10px'
                            horizontal
                            initialPrimarySize='60%'
                        >
                            <div style={{"height": "100%"}}>
                                <MultiFileEditor emitter={emitter}
                                                 setOpenFiles={setOpenFiles}
                                                 getOpenFiles={getOpenFiles}
                                />
                            </div>
                            Show website preview here.
                            <div style={{"padding": "100px", "width": "100%", "height": "100%" }}>
                                    <div style={{"width": "100%", "height": "100%" }}>
                                        <iframe style={{"width": "100%", "height": "100%" }}/>
                                    </div>
                            </div>
                        </Split>
                    </Split>
                </div>
                <div className="bottom">github @bootrino/reactoxide</div>
            </div>
        </>
    );
}

export default App;
