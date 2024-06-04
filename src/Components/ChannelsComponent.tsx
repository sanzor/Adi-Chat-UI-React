export interface ChannelsComponentProps{

}
const ChannelsComponent:React.FC<ChannelsComponentProps>=(props)=>{
    return(
    <>
       <div id="channelsPanel" className="channelsPanel">
                  <label id="channelsLabel">Channels</label>
                  <div id="channelsAreaPanel">
                          <div id="channelsContainer" className="chatScroll"></div>
                  </div>
        </div>
    </>
    )
}

export default ChannelsComponent;