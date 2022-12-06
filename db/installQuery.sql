-- uuid 익스텐션 설치

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 유저 테이블, 유저 아바타 테이블 생성

CREATE TABLE IF NOT EXISTS public.users (
    uid serial primary key,
    uuid uuid DEFAULT uuid_generate_v4 (),
    userId VARCHAR (20) unique not null,
    userPw VARCHAR not null,
    userEmail VARCHAR (255) unique not null,
    userName VARCHAR (15) not null,
    townName VARCHAR (50) not null,
    townBio VARCHAR (200),
    landType VARCHAR (20) not null DEFAULT 'basicLand',
    skyType VARCHAR (20) not null DEFAULT 'basicSky',
    floorType VARCHAR (20),
    joinedDate TIMESTAMPTZ not null DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMPTZ,
    isAdmin BOOLEAN DEFAULT 'false'
);

CREATE TABLE IF NOT EXISTS public.usersAvatar (
    uid serial primary key,
    uuid VARCHAR unique not null,
    skin VARCHAR (20) not null DEFAULT 'basicSkin',
    hair VARCHAR (20) not null DEFAULT 'basicHair',
    cap VARCHAR (20),
    top VARCHAR (20) DEFAULT 'basicTop',
    bottom VARCHAR (20) DEFAULT 'basicPants',
    coat VARCHAR (20),
    dress VARCHAR (20),
    shoes VARCHAR (20) DEFAULT 'basicShoes',
    bag VARCHAR (20),
    acc VARCHAR (20)
);

-- 인벤토리 생성

CREATE TABLE IF NOT EXISTS public.itemOwnedAvatar (
    uid serial primary key,
    ownerUuid VARCHAR not null,
    itemType VARCHAR (10) not null,
    itemId VARCHAR (20) not null,
    isOnAvatar BOOLEAN not null DEFAULT 'false'
);

CREATE TABLE IF NOT EXISTS public.itemOwnedTown (
    uid serial primary key,
    ownerUuid VARCHAR not null,
    itemType VARCHAR (10) not null,
    itemId VARCHAR (20) not null,
    isOnTown BOOLEAN not null DEFAULT 'false',
    position JSON not null DEFAULT '{ "x": 0, "y": 0, "z": 0, "dir": 0}',
    itemURL VARCHAR,
    itemBIO VARCHAR(20),
    functionJSON JSON
);

CREATE TABLE IF NOT EXISTS public.itemOwnedDrop (
    uid serial primary key,
    ownerUuid VARCHAR not null,
    itemType VARCHAR (10) not null,
    itemId VARCHAR (20) not null,
    itemLeft INT not null DEFAULT 0
);

-- 아이템 리스트 생성

-- 아바타 아이템

CREATE TABLE IF NOT EXISTS public.itemListAvatar (
    uid serial primary key,
    itemType VARCHAR (10) not null,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    isOnShop BOOLEAN not null DEFAULT 'true',
    price INT not null
);

-- 타운 아이템

CREATE TABLE IF NOT EXISTS public.itemListSpace (
    uid serial primary key,
    category VARCHAR (10) not null,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT DEFAULT 1,
    isOnShop BOOLEAN not null DEFAULT 'true',
    price INT not null
);

CREATE TABLE IF NOT EXISTS public.itemListHouse (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    isOnShop BOOLEAN not null DEFAULT 'true',
    price INT not null,
    size VARCHAR (5) not null
);

CREATE TABLE IF NOT EXISTS public.itemListPlant (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    isOnShop BOOLEAN not null DEFAULT 'true',
    price INT not null,
    growTime INT,
    dropItem VARCHAR (20),
    dropPeriod INT
);

CREATE TABLE IF NOT EXISTS public.itemListPet (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    isOnShop BOOLEAN not null DEFAULT 'true',
    price INT not null,
    growTime INT, -- 완전히 자라는 데 걸리는 시간. 일 단위
    dropItem VARCHAR (20), -- 드랍하는 아이템의 영문 식별자
    dropPeriod INT, -- 아이템을 드랍할 때까지 걸리는 시간. 밀리초 단위
    speed Numeric -- 맵을 돌아다니는 속도. 0.5초마다 몇 칸 이동할 것인지 저장
);

CREATE TABLE IF NOT EXISTS public.itemListConsumable (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    canBeEaten BOOLEAN not null DEFAULT 'true', -- 음식만 저장할 계획이므로 일단 true. 상점에서 팔지는 않습니다.
    price INT not null -- 만약 상점에서 판다면 사는 데 드는 비용. 아이템 처분 시 드는 비용은 * 0.7 해야 합니다.
);

CREATE TABLE IF NOT EXISTS public.itemListBlock (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    isOnShop BOOLEAN not null DEFAULT 'true', 
    price INT not null, 
    function VARCHAR (30) -- 혹시나 있을지 모를 자잘한 기능을 불러올 경우 함수 이름이 저장됩니다.
);

-- 드랍 아이템

CREATE TABLE IF NOT EXISTS public.itemListHarvest (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    isOnHarvestShop BOOLEAN not null DEFAULT 'true', -- 공식샵이 아니라 밭을 클릭하면 로딩되는 작은 창에서 구매할 수 있고, 구매하면 바로 심겨집니다.
    price INT not null,
    dropItem VARCHAR (20),
    dropPeriod INT
);

CREATE TABLE IF NOT EXISTS public.itemListDrop (
    uid serial primary key,
    itemId VARCHAR (20) not null,
    itemName VARCHAR (20) not null,
    description VARCHAR (50) not null,
    invenLimit INT,
    price INT not null -- 만약 상점에서 판다면 사는 데 드는 비용. 아이템 처분 시 드는 비용은 * 0.7 해야 합니다.
);

--SELECT * FROM users WHERE true;