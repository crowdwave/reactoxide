import React from 'react';
import {DefaultSplitter, Split, RenderSplitterProps} from '@geoffcox/react-splitter';
import {VerticalStripedSplitter, HorizontalStripedSplitter, SolidSplitter} from './CustomSplitters';
import ShadowDom from './ShadowDom';
import EventEmitter from "eventemitter3";
import {MultiFileEditor} from "./editor/MultiFileEditor"
import {FiletreeRoot} from "./filetree/FiletreeRoot";

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
                <div className="top" style={{"fontSize": "2em"}}>
                    React OxIDE
                    <div className="float-end" style={{"fontSize": ".5em"}}>
                        <a href={"https://github.com/bootrino/reactoxide"}>
                            <img style={{"width": "48px", "marginRight": "10px"}} src={"GitHub-Mark-Light-64px.png"}/>
                            https://github.com/bootrino/reactoxide
                        </a>
                    </div>
                </div>
                <div className="middle App" style={{"backgroundColor": "#262731"}}>
                    <Split
                        renderSplitter={() => <SolidSplitter/>}
                        initialPrimarySize='30%'
                        splitterSize='10px'
                    >
                        <div style={{"height": "100%", "overflowY": "scroll"}}>
                            <ShadowDom>
                                <div style={{"padding": "10px"}}>
                                    <FiletreeRoot emitter={emitter}/>
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
                            <div style={{"padding": "100px", "width": "100%", "height": "100%"}}>
                                <div style={{"width": "100%", "height": "100%"}}>
                                    <iframe style={{"width": "100%", "height": "100%"}}/>
                                </div>
                            </div>
                        </Split>
                    </Split>
                </div>
                <div className="bottom">copyright 2021 Andrew Stuart andrew.stuart@supercoders.com.au</div>
            </div>
        </>
    );
}

export default App;
