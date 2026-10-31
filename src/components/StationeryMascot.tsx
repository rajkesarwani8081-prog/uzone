import React from 'react';

export const StationeryMascot: React.FC = () => {
  return (
    <div className="stationery-scene" aria-hidden="true">
      <div className="studio-glow"></div>
      <div className="notebook-3d">
        <div className="notebook-edge"></div>
        <div className="notebook-page">
          <div className="notebook-rings">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
          <span className="paper-kicker">UZONE NOTES</span>
          <strong>Quiz smart.</strong>
          <span className="paper-highlight">Learn better.</span>
          <i className="paper-rule one"></i>
          <i className="paper-rule two"></i>
          <span className="paper-check">✓</span>
        </div>
      </div>
      <div className="pen-float">
        <div className="pen-3d">
          <span className="pen-nib"></span>
          <span className="pen-body">
            <i></i>
            <b>UZONE</b>
          </span>
          <span className="pen-clip"></span>
          <span className="pen-end"></span>
        </div>
      </div>
      <div className="marker-float">
        <div className="marker-3d">
          <span className="marker-cap"></span>
          <span className="marker-body">
            <b>MARK</b>
          </span>
          <span className="marker-tip"></span>
        </div>
      </div>
      <span className="scene-spark spark-one">✦</span>
      <span className="scene-spark spark-two">✦</span>
    </div>
  );
};
