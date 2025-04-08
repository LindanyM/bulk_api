const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { readdirSync } = require('fs');
const pool = require('./data/config');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('assets'));
app.options('*', cors());

// Swagger setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const serverless = require('serverless-http');

// Example API Route
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Vercel!' });
});
// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Burning Bush Ministries - Bulk Endpoint API',
      version: '1.0.0',
      description:
        'Planting cell churches in every community. Equipping the saints to do the work of the ministry through five fold ministry. Each believer reaching one soul. Raising leaders continuously.',
      contact: {
        name: 'Lindani Mabaso | Burning Bush Ministries',
      },
    },
    servers: [
      { url: 'https://asset-registry-qo7f69a59-lindanys-projects.vercel.app/api/' },
      { url: 'http://localhost:8080' },
    ],
  },
  apis: ['*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Church:
 *       type: object
 *       required:
 *         - churchName
 *         - location
 *       properties:
 *         churchId:
 *           type: integer
 *         churchName:
 *           type: string
 *         location:
 *           type: string
 *         branch:
 *           type: string
 *         province:
 *           type: string
 *         city:
 *           type: string
 *         region:
 *           type: string
 *         pastorId:
 *           type: integer
 */

//============================================= CHURCH ROUTES =================================

/**
 * @swagger
 * /api/Church:
 *   get:
 *     summary: Retrieve all churches
 *     responses:
 *       200:
 *         description: A list of churches
 */
app.get('/api/Church', (req, res) => {
  pool.query('SELECT * FROM Church', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /api/Church/{churchId}:
 *   get:
 *     summary: Get a church by ID
 *     parameters:
 *       - in: path
 *         name: churchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Church found
 *       404:
 *         description: Church not found
 */
app.get('/api/Church/:churchId', (req, res) => {
  const churchId = parseInt(req.params.churchId);
  pool.query('SELECT * FROM Church WHERE churchId = ?', [churchId], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ message: 'Church not found' });
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /api/Church:
 *   post:
 *     summary: Create a new church
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Church'
 *     responses:
 *       201:
 *         description: Church created
 */
app.post('/api/Church', (req, res) => {
  const { churchName, location, branch, province, city, region, pastorId } = req.body;
  const sql = `INSERT INTO Church (churchName, location, branch, province, city, region, pastorId) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  pool.query(sql, [churchName, location, branch, province, city, region, pastorId], (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ message: 'Church created successfully', result });
  });
});

/**
 * @swagger
 * /api/Church:
 *   put:
 *     summary: Update a church
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Church'
 *     responses:
 *       200:
 *         description: Church updated
 */
app.put('/api/Church', (req, res) => {
  const { churchId, churchName, location, branch, province, city, region, pastorId } = req.body;
  const sql = `
    UPDATE Church SET 
      churchName = ?, location = ?, branch = ?, province = ?, city = ?, region = ?, pastorId = ?
    WHERE churchId = ?
  `;
  pool.query(sql, [churchName, location, branch, province, city, region, pastorId, churchId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Church updated successfully', result });
  });
});

/**
 * @swagger
 * /api/Church/{id}:
 *   delete:
 *     summary: Delete a church by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Church deleted
 *       404:
 *         description: Church not found
 */
app.delete('/api/Church/:id', (req, res) => {
  const churchId = parseInt(req.params.id);
  pool.query('DELETE FROM Church WHERE churchId = ?', [churchId], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(404).json({ message: 'Church not found' });
    res.status(200).json({ message: 'Church deleted successfully' });
  });
});


// =========================================== PERSON =========================================

/**
 * @swagger
 * /api/Person:
 *   get:
 *     summary: Retrieve all people
 *     description: Get a list of all available people.
 *     responses:
 *       '200':
 *         description: A list of people
 *       '401':
 *         description: Unaurthorized
 *       '500':
 *         description: Internal server error
 */
app.get('/api/Person', async (req, res) => {
    try {
        pool.query(`select * from Person`, (err, result) => {
            if (err) {
                return err;
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Person/{id}:
 *   get:
 *     summary: Retrieve a person by ID
 *     description: Get a person by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the person to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Details of the person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       '404':
 *         description: Person not found
 */
// GET a church by ID
app.get('/api/Person/:id', async (req, res) => {
    const personId = parseInt(req.params.id);
    try {
        pool.query(`select * from Person where personId=${personId}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'Person not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Person:
 *   post:
 *     summary: Add a new person 
 *     description: Add details of a person
  *     parameters:
 *      - in: body
 *        name: Person
 *        description: Add a new person
 *        schema:
 *            type: object
 *            properties:  
 *               personId: 
 *                 type: integer
 *               address:
 *                 type: string
 *               comments: 
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               gender: 
 *                 type: int
 *               maritalStatus:
 *                 type: string
 *               name: 
 *                 type: string
 *               surname:
 *                 type: string
 *               churchId: 
 *                 type: integer
 *               cellLeader:
 *                 type: string
 *               cellLocation: 
 *                 type: string
 *               ministry:
 *                 type: string
 *               church:
 *                 type: string
 *               region:
 *                 type: string
 *               seedContribution:
 *                 type: integer
 *               regContribution:
 *                 type: integer
 *               amount:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Person updated successfully
 *       '404':
 *         description: Person not found
 *       '500':
 *         description: Internal server error
 */
app.post('/api/Person', async (request, response) => {
    //const churchId = request.body.churchId;
    const personId = request.body.personId;
    const address = request.body.address;
    const comments = request.body.comments;
    const contactNumber = request.body.contactNumber;
    const gender = request.body.gender;
    const maritalStatus = request.body.maritalStatus;
    const name = request.body.name;
    const surname = request.body.surname;
    const churchId = request.body.churchId;
    const cellLeader = request.body.cellLeader;
    const cellLocation = request.body.cellLocation;
    const church = request.body.church;
    const ministry = request.body.ministry;
    const region = request.body.region;
    const regContribution = request.body.regContribution;
    const seedContribution = request.body.seedContribution;
    const amount = request.body.amount;

    console.log(request.body)
    var sql = `INSERT INTO Person
    (personId, address, comments, contactNumber, gender, maritalStatus, name, surname, churchId, cellLeader, cellLocation, ministry, church, region, regContribution, seedContribution, amount) VALUES 
    ('${personId}', '${address}', '${comments}', '${contactNumber}', '${gender}', '${maritalStatus}' , '${name}', '${surname}' , '${churchId}', '${cellLeader}', '${cellLocation}' , '${ministry}', '${church}', '${region}', '${regContribution}', '${seedContribution}', '${amount}')`;

    try {
        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Person:
 *   put:
 *     summary: Update a Person by ID
 *     description: Update an existing Person entity by its ID.
*     parameters:
 *      - in: body
 *        name: Person
 *        description: Add a new Person
 *        schema:
 *            type: object
 *            properties:  
 *               personId: 
 *                 type: integer
 *               address:
 *                 type: string
 *               comments: 
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               gender: 
 *                 type: int
 *               maritalStatus:
 *                 type: string
 *               name: 
 *                 type: string
 *               surname:
 *                 type: string
 *               churchId: 
 *                 type: integer
 *               cellLeader:
 *                 type: string
 *               cellLocation: 
 *                 type: string
 *               ministry:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Person updated successfully
 *       '404':
 *         description: Person not found
 *       '500':
 *         description: Internal server error
 */
// Update a Person by ID
app.put('/api/Person/{id}', async (request, res) => {
    const personId = request.body.personId;
    const address = request.body.address;
    const comments = request.body.comments;
    const contactNumber = request.body.contactNumber;
    const gender = request.body.gender;
    const maritalStatus = request.body.maritalStatus;
    const name = request.body.name;
    const surname = request.body.surname;
    const churchId = request.body.churchId;
    const cellLeader = request.body.cellLeader;
    const cellLocation = request.body.cellLocation;
    const ministry = request.body.ministry;
    const church = request.body.church;
    const region = request.body.region;
    const regContribution = request.body.regContribution;
    const seedContribution = request.body.seedContribution;
    const amount = request.body.amount;


    try {
        console.log(request.body)
        var sql = `UPDATE Person
        SET  address='${address}', comments='${comments}', contactNumber='${contactNumber}', gender='${gender}', maritalStatus='${maritalStatus}', name='${name}', surname='${surname}', churchId='${churchId}', cellLeader='${cellLeader}', cellLocation='${cellLocation}', ministry='${ministry}', church='${church}', region='${region}', regContribution='${regContribution}', seedContribution='${seedContribution}', amount='${amount}'
        WHERE personId='${personId}' `;

        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Person/{id}:
 *   delete:
 *     summary: Delete a Person by ID
 *     description: Remove an existing Person entity by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Person to delete.
 *     responses:
 *       '200':
 *         description: Person deleted successfully
 *       '404':
 *         description: Person not found
 *       '500':
 *         description: Internal server error
 */
// Delete a Person by ID
app.delete('/api/Person/{id}', async (req, res) => {
    const personId = req.params.id;
    try {
        pool.query(`delete from Person where personId=${personId}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'Person not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================== STATS =========================================

/**
 * @swagger
 * /api/Stats:
 *   get:
 *     summary: Retrieve all Stats
 *     description: Get a list of all available Stats.
 *     responses:
 *       '200':
 *         description: A list of Stats
 *       '401':
 *         description: Unaurthorized
 *       '500':
 *         description: Internal server error
 */
app.get('/api/Stats', async (req, res) => {
    try {
        pool.query(`select * from Stats`, (err, result) => {
            if (err) {
                return err;
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Stats/{id}:
 *   get:
 *     summary: Retrieve a Stats by ID
 *     description: Get a Stats by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the Stats to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Details of the Stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 *       '404':
 *         description: Stats not found
 */
// GET a church by ID
app.get('/api/Stats/:id', async (req, res) => {
    const statsId = parseInt(req.params.id);
    try {
        pool.query(`select * from Stats where statsId=${statsId}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'Stats not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Stats:
 *   post:
 *     summary: Add a new Stats 
 *     description: Add details of a Stats
  *     parameters:
 *      - in: body
 *        name: Stats
 *        description: Add a new Stats
 *        schema:
 *            type: object
 *            properties:  
 *               adult:
 *                 type: integer
 *               car: 
 *                 type: integer
 *               fk:
 *                 type: integer
 *               saved: 
 *                 type: integer
 *               offering:
 *                 type: integer
 *               visitors: 
 *                 type: integer
 *               date:
 *                 type: integer
 *               churchId: 
 *                 type: integer
 *               aow:
 *                 type: integer
 *               ck: 
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Stats updated successfully
 *       '404':
 *         description: Stats not found
 *       '500':
 *         description: Internal server error
 */
app.post('/api/Stats', async (request, response) => {
    const adult = request.body.adult;
    const car = request.body.car;
    const fk = request.body.fk;
    const saved = request.body.saved;
    const offering = request.body.offering;
    const visitors = request.body.visitors;
    const date = request.body.date;
    const churchId = request.body.churchId;
    const aow = request.body.aow;
    const ck = request.body.ck;
    console.log(request.body)
    var sql = `INSERT INTO Stats
    (adult, car, fk, saved, offering, visitors, date, churchId, aow, ck) VALUES 
    ('${adult}', '${car}', '${fk}', '${saved}' , '${offering}', '${visitors}' ,'${date}' , '${churchId}', '${aow}', '${ck}')`;

    try {
        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Stats:
 *   put:
 *     summary: Update a new Stats 
 *     description: Add details of a Stats
  *     parameters:
 *      - in: body
 *        name: Stats
 *        description: Add a new Stats
 *        schema:
 *            type: object
 *            properties:  
 *               statsId: 
 *                 type: integer
 *               adult:
 *                 type: integer
 *               car: 
 *                 type: integer
 *               fk:
 *                 type: integer
 *               saved: 
 *                 type: integer
 *               offering:
 *                 type: integer
 *               visitors: 
 *                 type: integer
 *               date:
 *                 type: integer
 *               churchId: 
 *                 type: integer
 *               aow:
 *                 type: integer
 *               ck: 
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Stats updated successfully
 *       '404':
 *         description: Stats not found
 *       '500':
 *         description: Internal server error
 */
app.put('/api/Stats', async (request, response) => {
    const statsId = request.body.statsId;
    const adult = request.body.adult;
    const car = request.body.car;
    const fk = request.body.fk;
    const saved = request.body.saved;
    const offering = request.body.offering;
    const visitors = request.body.visitors;
    const date = request.body.date;
    const churchId = request.body.churchId;
    const aow = request.body.aow;
    const ck = request.body.ck;
    console.log(request.body)
    var sql = `UPDATE Stats
    SET  adult='${adult}', car='${car}', fk='${fk}', saved='${saved}', offering='${offering}', visitors='${visitors}', date='${date}', churchId='${churchId}', aow='${aow}', ck='${ck}'
    WHERE statsId='${statsId}' `;

    try {
        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Stats/{statsId}:
 *   delete:
 *     summary: Delete a Stats by ID
 *     description: Remove an existing Stats entity by its ID.
 *     parameters:
 *       - in: path
 *         name: statsId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Stats to delete.
 *     responses:
 *       '200':
 *         description: Stats deleted successfully
 *       '404':
 *         description: Stats not found
 *       '500':
 *         description: Internal server error
 */
// Delete a Stats by ID
app.delete('/api/Stats/:{statsId}', async (req, res) => {
    const statsId = req.params.statsId;
    console.log("Stats ID: "+statsId)
    try {
        pool.query(`delete * from Stats where statsId=${statsId}`, (err, result) => {
            console.log("Stats ID: "+err)

            if (err) {
                res.status(404).json({ message: 'Stats not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================== USER =========================================
/**
 * @swagger
 * /api/User:
 *   get:
 *     summary: Retrieve all Users
 *     description: Get a list of all available Users.
 *     responses:
 *       '200':
 *         description: A list of Users
 *       '401':
 *         description: Unaurthorized
 *       '500':
 *         description: Internal server error
 */
app.get('/api/User', async (req, res) => {
    try {
        pool.query(`select * from User`, (err, result) => {
            if (err) {
                return err;
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/User/{id}:
 *   get:
 *     summary: Retrieve a User by ID
 *     description: Get a User by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the User to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Details of the User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 */
// GET a User by ID
app.get('/api/User/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        pool.query(`select * from User where userId=${userId}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'User not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/User:
 *   post:
 *     summary: Add a new User 
 *     description: Add details of a User
  *     parameters:
 *      - in: body
 *        name: User
 *        description: Add a new User
 *        schema:
 *            type: object
 *            properties:  
 *               role:
 *                 type: integer
 *               username: 
 *                 type: string
 *               password:
 *                 type: string
 *               personId: 
 *                 type: integer
 *     responses:
 *       '200':
 *         description: User updated successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
app.post('/api/User', async (request, response) => {
    const role = request.body.role;
    const username = request.body.username;
    const password = request.body.password;
    const personId = request.body.personId;
    console.log(request.body)
    var sql = `INSERT INTO User
    (role, username, password, personId) VALUES 
    ('${role}', '${username}', '${password}', '${personId}')`;

    try {
        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /Login:
 *  post:
 *    summary: Login
 *    consumes:
 *      - application/json
 *    description: validate the credentials
 *    parameters:
 *      - in: body
 *        name: user
 *        description: username and Password to match existing user
 *        schema:
 *            type: object
 *            properties:
 *               username: 
 *                 type: string
 *               password:
 *                 type: string
 *    responses:
 *      '201':
 *        description: A successful response
 *      '404':
 *        description: no credentials found
 */

app.post('/Login/',(request, response) =>{
    const username =  request.body.username;
    const password= request.body.password;
    console.log("username:", username)
    console.log("Password:",password)

    pool.query(`select password from User where username=?`,username,(err, result) => {
        const res = JSON.parse(JSON.stringify(result));

        if (res == [] || res == undefined || err) {
            console.log("err:", err)
            response.status(500).send("Unaurthorized, Invalid Username")
        } else {
            const resultPassword = res[0].password;
            console.log("Results:",resultPassword)
    
            if(resultPassword != password){
                response.status(401).send("Unaurthorized, invalid password")
            }
            response.status(200).send("Auth Successfully, Access Granted!!");
        }
    })
   
});


/**
 * @swagger
 * /api/User:
 *   put:
 *     summary: Update a User by ID
 *     description: Update an existing User entity by its ID.
*     parameters:
 *      - in: body
 *        name: User
 *        description: Add a new User
 *        schema:
 *            type: object
 *            properties:  
 *               userId: 
 *                 type: integer
 *               role:
 *                 type: integer
 *               username: 
 *                 type: string
 *               password:
 *                 type: string
 *               personId: 
 *                 type: integer
 *     responses:
 *       '200':
 *         description: User updated successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Update a User by ID
app.put('/api/User/{id}', async (request, res) => {
    const userId = request.body.userId;
    const role = request.body.role;
    const username = request.body.username;
    const password = request.body.password;
    const personId = request.body.personId;

    try {
        console.log(request.body)
        var sql = `UPDATE User
        SET  role='${role}', username='${username}', password='${password}', personId='${personId}'
        WHERE userId='${userId}' `;

        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/User/{id}:
 *   delete:
 *     summary: Delete a User by ID
 *     description: Remove an existing User entity by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the User to delete.
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
// Delete a User by ID
app.delete('/api/User/{id}', async (req, res) => {
    const userId = req.params.id;
    try {
        pool.query(`delete from User where userId=${userId}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'User not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================== CALENDAR =========================================

/**
 * @swagger
 * /api/Calendar:
 *   get:
 *     summary: Retrieve all Calendar events
 *     description: Get a list of all available calendar events.
 *     responses:
 *       '200':
 *         description: A list of events
 *       '401':
 *         description: Unaurthorized
 *       '500':
 *         description: Internal server error
 */
app.get('/api/Calendar', async (req, res) => {
    try {
        pool.query(`select * from Calendar`, (err, result) => {
            if (err) {
                return err;
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Calendar/{id}:
 *   get:
 *     summary: Retrieve a Calendar by ID
 *     description: Get a Calendar by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the Calendar to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Details of the Calendar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calendar'
 *       '404':
 *         description: Calendar not found
 */
// GET a calendar by ID
app.get('/api/Calendar/:id', async (req, res) => {
    const calendarId = parseInt(req.params.id);
    try {
        pool.query(`select * from Calendar where Id=${calendarId}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'Calendar event not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Calendar:
 *   post:
 *     summary: Add a new Calendar 
 *     description: Add details of a Calendar
 *     parameters:
 *      - in: body
 *        name: Calendar
 *        description: Add a new Calendar
 *        schema:
 *            type: object
 *            properties:  
 *               name:
 *                 type: string
 *               time: 
 *                 type: string
 *               month:
 *                 type: string
 *               year: 
 *                 type: integer
 *               department:
 *                 type: string
 *               region: 
 *                 type: string
 *               dayFrom:
 *                 type: string
 *               dayTo: 
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Calendar updated successfully
 *       '404':
 *         description: Calendar not found
 *       '500':
 *         description: Internal server error
 */
app.post('/api/Calendar', async (request, response) => {
    const name = request.body.name;
    const time = request.body.time;
    const month = request.body.month;
    const year = request.body.year;
    const department = request.body.department;
    const region = request.body.region;
    const dayFrom = request.body.dayFrom;
    const dayTo = request.body.dayTo;
    console.log(request.body)
    var sql = `INSERT INTO Calendar
    (name, time, month, year, department, region, dayFrom, dayTo) VALUES 
    ('${name}', '${time}', '${month}', '${year}', '${department}', '${region}' , '${dayFrom}', '${dayTo}')`;

    try {
        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Calendar:
 *   put:
 *     summary: Update a Calendar 
 *     description: Update details of a Calendar
 *     parameters:
 *      - in: body
 *        name: Calendar
 *        description: Update a  Calendar
 *        schema:
 *            type: object
 *            properties:  
 *               name:
 *                 type: string
 *               time: 
 *                 type: string
 *               month:
 *                 type: string
 *               year: 
 *                 type: integer
 *               department:
 *                 type: string
 *               region: 
 *                 type: string
 *               dayFrom:
 *                 type: string
 *               dayTo: 
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Calendar updated successfully
 *       '404':
 *         description: Calendar not found
 *       '500':
 *         description: Internal server error
 */
app.put('/api/Calendar/{id}', async (request, response) => {
    const id = request.body.id;
    const name = request.body.name;
    const time = request.body.time;
    const month = request.body.month;
    const year = request.body.year;
    const department = request.body.department;
    const region = request.body.region;
    const dayFrom = request.body.dayFrom;
    const dayTo = request.body.dayTo;
    console.log(request.body)
    console.log(request.body)
    var sql = `UPDATE Calendar
    SET name='${name}', time='${time}', month='${month}', year='${year}', department='${department}', region='${region}', dayFrom='${dayFrom}', dayTo='${dayTo}') VALUES 
    WHERE id='${id}' `;

    try {
        pool.query(sql, (err, result) => {
            console.log("Results:", result)

            if (err) {
                console.log("err:", err)
                return err;
            }
            response.status(200).send(result);
        })
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Calendar/{id}:
 *   delete:
 *     summary: Delete a Calendar by ID
 *     description: Remove an existing Calendar entity by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Calendar to delete.
 *     responses:
 *       '200':
 *         description: Calendar deleted successfully
 *       '404':
 *         description: Calendar not found
 *       '500':
 *         description: Internal server error
 */
// Delete a Calendar by ID
app.delete('/api/Calendar/{id}', async (req, res) => {
    const id = req.params.id;
    try {
        pool.query(`delete from Calendar where id=${id}`, (err, result) => {
            if (err) {
                res.status(404).json({ message: 'Calendar not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================== ASSERTS =========================================
/**
 * @swagger
 * /api/Assets:
 *   get:
 *     summary: Retrieve all Assets
 *     description: Get a list of all available Assets.
 *     responses:
 *       '200':
 *         description: A list of Assets
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
app.get('/api/Assets', async (req, res) => {
    try {
        pool.query(`select * from Assets`, (err, result) => {
            if (err) {
                return err;
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/Assets/{id}:
 *   get:
 *     summary: Retrieve an Asset by ID
 *     description: Get an Asset by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the Asset to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Details of the Asset
 *       '404':
 *         description: Asset not found
 */
app.get('/api/Assets/:id', async (req, res) => {
    const assetId = parseInt(req.params.id);
    try {
        pool.query(`select * from Assets where asset_id=${assetId}`, (err, result) => {
            if (err || result.length === 0) {
                res.status(404).json({ message: 'Asset not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Assets:
 *   post:
 *     summary: Add a new Asset
 *     description: Add a new Asset, associating it with a valid location.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:  
 *               location_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               purchase_date:
 *                 type: string
 *                 format: date
 *               purchase_price:
 *                 type: number
 *               serial_number:
 *                 type: string
 *               category:
 *                 type: string
 *               condition:
 *                 type: string
 *               last_maintenance_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Asset added successfully
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Location not found
 *       '500':
 *         description: Internal server error
 */
app.post('/api/Assets', async (req, res) => {
    const {
        location_id,
        name,
        description,
        purchase_date,
        purchase_price,
        serial_number,
        category,
        condition,
        last_maintenance_date
    } = req.body;

    console.log('Received data:', req.body);

    if (!location_id || isNaN(location_id)) {
        return res.status(400).json({ message: 'Invalid or missing location_id' });
    }

    const checkLocationSQL = `SELECT name FROM Locations WHERE location_id = ?`;

    pool.query(checkLocationSQL, [location_id], (err, locationResult) => {
        if (err) {
            console.error('Error querying location:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (!locationResult || locationResult.length === 0) {
            return res.status(404).json({ message: 'Invalid location ID' });
        }

        const location_name = locationResult[0].name;

        const insertSQL = `
            INSERT INTO Assets (
                location_id, name, description, purchase_date, purchase_price,
                serial_number, category, \`condition\`, last_maintenance_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            location_id,
            name,
            description,
            purchase_date || null,
            purchase_price || null,
            serial_number,
            category,
            condition,
            last_maintenance_date || null
        ];

        pool.query(insertSQL, values, (err, result) => {
            if (err) {
                console.error('Error inserting asset:', err);
                return res.status(500).json({ message: 'Error adding asset', error: err.message });
            }

            res.status(200).json({
                message: `Asset '${name}' added successfully at location '${location_name}'`,
                assetId: result.insertId
            });
        });
    });
});


// /**
//  * @swagger
//  * /api/Assets:
//  *   post:
//  *     summary: Add a new Asset
//  *     description: Add a new Asset.
//  *     parameters:
//  *      - in: body
//  *        name: Asset
//  *        description: Add a new Asset
//  *        schema:
//  *            type: object
//  *            properties:  
//  *               location_id:
//  *                 type: integer
//  *               name:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               purchase_date:
//  *                 type: string
//  *                 format: date
//  *               purchase_price:
//  *                 type: number
//  *                 format: decimal
//  *               serial_number:
//  *                 type: string
//  *               category:
//  *                 type: string
//  *               condition:
//  *                 type: string
//  *               last_maintenance_date:
//  *                 type: string
//  *                 format: date
//  *     responses:
//  *       '200':
//  *         description: Asset added successfully
//  *       '400':
//  *         description: Bad Request
//  *       '500':
//  *         description: Internal server error
//  */
// app.post('/api/Assets', async (req, res) => {
//     const { location_id, name, description, purchase_date, purchase_price, serial_number, category, condition, last_maintenance_date } = req.body;
//     const sql = `INSERT INTO Assets (location_id, name, description, purchase_date, purchase_price, serial_number, category, condition, last_maintenance_date) 
//                  VALUES ('${location_id}', '${name}', '${description}', '${purchase_date}', ${purchase_price}, '${serial_number}', '${category}', '${condition}', '${last_maintenance_date}')`;

//     try {
//         pool.query(sql, (err, result) => {
//             if (err) {
//                 return res.status(400).json({ message: err.message });
//             }
//             res.status(200).send(result);
//         })
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

/**
 * @swagger
 * /api/Assets/{id}:
 *   put:
 *     summary: Update an Asset
 *     description: Update an existing Asset.
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: body
 *        name: Asset
 *        description: Update an existing Asset
 *        schema:
 *            type: object
 *            properties:  
 *               location_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               purchase_date:
 *                 type: string
 *                 format: date
 *               purchase_price:
 *                 type: number
 *                 format: decimal
 *               serial_number:
 *                 type: string
 *               category:
 *                 type: string
 *               condition:
 *                 type: string
 *               last_maintenance_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Asset updated successfully
 *       '404':
 *         description: Asset not found
 *       '500':
 *         description: Internal server error
 */
app.put('/api/Assets/:id', async (req, res) => {
    const assetId = req.params.id;
    const { location_id, name, description, purchase_date, purchase_price, serial_number, category, condition, last_maintenance_date } = req.body;
    const sql = `UPDATE Assets SET 
        location_id='${location_id}', name='${name}', description='${description}', purchase_date='${purchase_date}', 
        purchase_price=${purchase_price}, serial_number='${serial_number}', category='${category}', 
        condition='${condition}', last_maintenance_date='${last_maintenance_date}' 
        WHERE asset_id=${assetId}`;

    try {
        pool.query(sql, (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(404).json({ message: 'Asset not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/Assets/{id}:
 *   delete:
 *     summary: Delete an Asset by ID
 *     description: Remove an existing Asset entity by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the Asset to delete.
 *     responses:
 *       '200':
 *         description: Asset deleted successfully
 *       '404':
 *         description: Asset not found
 *       '500':
 *         description: Internal server error
 */
app.delete('/api/Assets/:id', async (req, res) => {
    const assetId = req.params.id;
    try {
        pool.query(`DELETE FROM Assets WHERE asset_id=${assetId}`, (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(404).json({ message: 'Asset not found' });
            }
            res.status(200).send(result);
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ================================ LOCATIONS ROUTES ================================

/**
 * @swagger
 * /api/Locations:
 *   get:
 *     summary: Retrieve all Locations
 *     description: Get a list of all available Locations.
 *     responses:
 *       200:
 *         description: A list of Locations
 *       500:
 *         description: Internal server error
 */
app.get('/api/Locations', (req, res) => {
    pool.query('SELECT * FROM Locations', (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(result);
    });
});

/**
 * @swagger
 * /api/Locations:
 *   post:
 *     summary: Add a new Location
 *     description: Add a new Location.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - contact_person
 *               - contact_phone
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location added successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
app.post('/api/Locations', (req, res) => {
    const { name, address, contact_person, contact_phone } = req.body;
    console.log("POST - LOCATION - req.body", req.body)
    const sql = `INSERT INTO Locations (name, address, contact_person, contact_phone) VALUES (?, ?, ?, ?)`;

    pool.query(sql, [name, address, contact_person, contact_phone], (err, result) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json({ message: 'Location added successfully', result });
    });
});

/**
 * @swagger
 * /api/Locations/{id}:
 *   put:
 *     summary: Update a Location
 *     description: Update an existing Location.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - contact_person
 *               - contact_phone
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
app.put('/api/Locations/:id', (req, res) => {
    const locationId = parseInt(req.params.id);
    const { name, address, contact_person, contact_phone } = req.body;
    const sql = `
        UPDATE Locations SET name = ?, address = ?, contact_person = ?, contact_phone = ? 
        WHERE location_id = ?
    `;

    pool.query(sql, [name, address, contact_person, contact_phone, locationId], (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ message: 'Location not found or update failed' });
        }
        res.status(200).json({ message: 'Location updated successfully', result });
    });
});

/**
 * @swagger
 * /api/Locations/{id}:
 *   delete:
 *     summary: Delete a Location by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/Locations/:id', (req, res) => {
    const locationId = parseInt(req.params.id);
    pool.query('DELETE FROM Locations WHERE location_id = ?', [locationId], (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json({ message: 'Location deleted successfully' });
    });
});

//============================================= START SERVER =========================================

// Export as serverless function
module.exports.handler = serverless(app);
// Start the server
app.listen(PORT, () => {
    console.log(`🔥 Server running at http://localhost:${PORT}`);
  });

