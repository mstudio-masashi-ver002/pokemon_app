import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>ポケモンバトルへようこそ！</h1>
      <p>あなたのポケモンを捕まえて、他のポケモンとバトルしよう！</p>
      {/* ポケモンを捕まえるページへのリンク */}
      <Link to="/select">
        <button>ポケモンを捕まえに行く！</button>
      </Link>
      {/* 捕まえたポケモン一覧ページへのリンク */}
      <Link to="/caught">
        <button>捕まえたポケモンを確認する</button>
      </Link>
      <Link to="/battle">
        <button>バトルをする</button>
      </Link>
    </div>
  );
};

export default HomePage;