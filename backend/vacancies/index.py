import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Возвращает список вакансий из БД с фильтрацией по категории и поиском."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    category = params.get('category', '')
    search = params.get('search', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'], sslmode='disable')
    cur = conn.cursor()

    conditions = ["1=1"]
    args = []

    if category:
        conditions.append("category = %s")
        args.append(category)

    if search:
        conditions.append("(title ILIKE %s OR description ILIKE %s OR company ILIKE %s)")
        like = f"%{search}%"
        args.extend([like, like, like])

    query = (
        "SELECT id, title, category, description, company, salary, employment_type, created_at "
        f"FROM vacancies WHERE {' AND '.join(conditions)} ORDER BY created_at DESC"
    )

    cur.execute(query, args)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    vacancies = [
        {
            'id': r[0],
            'title': r[1],
            'category': r[2],
            'description': r[3],
            'company': r[4],
            'salary': r[5],
            'employment_type': r[6],
            'created_at': str(r[7]) if r[7] else None,
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'vacancies': vacancies}, ensure_ascii=False),
    }
