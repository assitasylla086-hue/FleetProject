--
-- PostgreSQL database dump
--

\restrict xOKK5b8G4AXjRcHhn1KjYJEG8x9ViOlLwJrKA6EBUSWlr36QfNVSa24UywNjaQa

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-03-04 11:40:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16398)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5800 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 17536)
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    vehicle_id integer,
    location public.geography(Point,4326),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17535)
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- TOC entry 5801 (class 0 OID 0)
-- Dependencies: 225
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- TOC entry 222 (class 1259 OID 17520)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17519)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5802 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 224 (class 1259 OID 17529)
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    name character varying(100),
    plate_number character varying(50)
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17528)
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- TOC entry 5803 (class 0 OID 0)
-- Dependencies: 223
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- TOC entry 5626 (class 2604 OID 17539)
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- TOC entry 5624 (class 2604 OID 17523)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5625 (class 2604 OID 17532)
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- TOC entry 5794 (class 0 OID 17536)
-- Dependencies: 226
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, vehicle_id, location, created_at) FROM stdin;
1	1	0101000020E61000000AD7A3703D0A10C0713D0AD7A3701540	2026-03-03 16:58:45.974842
2	1	0101000020E610000014AE47E17A1410C0F6285C8FC2751540	2026-03-03 16:58:45.974842
4	1	0101000020E61000000AD7A3703D0A10C0713D0AD7A3701540	2026-03-03 16:58:51.410798
5	1	0101000020E610000014AE47E17A1410C0F6285C8FC2751540	2026-03-03 16:58:51.410798
10	1	0101000020E610000000000000000024400000000000002440	2026-03-04 09:03:51.056667
13	10	0101000020E6100000DD240681951314C0DEAD2CD159B61E40	2026-03-04 09:10:30.284301
14	11	0101000020E6100000DD240681951314C0DEAD2CD159B61E40	2026-03-04 09:11:20.774639
\.


--
-- TOC entry 5623 (class 0 OID 16717)
-- Dependencies: 217
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 5790 (class 0 OID 17520)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password) FROM stdin;
1	mashiasylla@icloud.com	$2b$10$e8prjD2.R8AR8eod/Ri6OuOyeIzZ6tyRj4cQd/w9BGoXttYnHQe8W
\.


--
-- TOC entry 5792 (class 0 OID 17529)
-- Dependencies: 224
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, name, plate_number) FROM stdin;
1	RANGEROVER	XX-999-YY
10	VOITURE_SYLLA	AD-675-DA
11	MERCEDES	AB-123-AB
\.


--
-- TOC entry 5804 (class 0 OID 0)
-- Dependencies: 225
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 14, true);


--
-- TOC entry 5805 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 5806 (class 0 OID 0)
-- Dependencies: 223
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 11, true);


--
-- TOC entry 5639 (class 2606 OID 17544)
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- TOC entry 5632 (class 2606 OID 17527)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5634 (class 2606 OID 17525)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5636 (class 2606 OID 17534)
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- TOC entry 5637 (class 1259 OID 17550)
-- Name: idx_positions_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_positions_location ON public.positions USING gist (location);


--
-- TOC entry 5640 (class 2606 OID 17545)
-- Name: positions positions_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


-- Completed on 2026-03-04 11:40:37

--
-- PostgreSQL database dump complete
--

\unrestrict xOKK5b8G4AXjRcHhn1KjYJEG8x9ViOlLwJrKA6EBUSWlr36QfNVSa24UywNjaQa

