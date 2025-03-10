# Contextualizing
This fork proceeds with the work done by [Victor Netto](https://github.com/VictorNetto) in [PFC](https://github.com/VictorNetto/PFC). It intents to generalize the application by providing users flexibility to create roles and define their limitations. It also aims to add new features like a database, to store roles and users, and authentication, to securely identify who is accessing the application.

## How to run
### Project clone
```bash
git clone https://github.com/luis-fbs/RBCML.git
```

### Create virtual environment
```bash
python3 -m venv environment
```

###  Activate virtual environment
```bash
source environment/bin/activate
```

### Change directory
```bash
cd RBCML/
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Run
```bash
python3 run.py
```