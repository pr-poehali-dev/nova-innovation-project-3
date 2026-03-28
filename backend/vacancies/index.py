import json
import os
import urllib.parse
import pg8000.native


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

    dsn = urllib.parse.urlparse(os.environ['DATABASE_URL'])
    conn = pg8000.native.Connection(
        host=dsn.hostname,
        port=dsn.port or 5432,
        database=dsn.path.lstrip('/'),
        user=dsn.username,
        password=dsn.password,
        ssl_context=False,
    )

    if category and search:
        like = f"%{search}%"
        rows = conn.run(
            "SELECT id, title, category, description, company, salary, employment_type, created_at "
            "FROM vacancies WHERE category = :cat AND (title ILIKE :s OR description ILIKE :s OR company ILIKE :s) "
            "ORDER BY created_at DESC",
            cat=category, s=like
        )
    elif category:
        rows = conn.run(
            "SELECT id, title, category, description, company, salary, employment_type, created_at "
            "FROM vacancies WHERE category = :cat ORDER BY created_at DESC",
            cat=category
        )
    elif search:
        like = f"%{search}%"
        rows = conn.run(
            "SELECT id, title, category, description, company, salary, employment_type, created_at "
            "FROM vacancies WHERE title ILIKE :s OR description ILIKE :s OR company ILIKE :s "
            "ORDER BY created_at DESC",
            s=like
        )
    else:
        rows = conn.run(
            "SELECT id, title, category, description, company, salary, employment_type, created_at "
            "FROM vacancies ORDER BY created_at DESC"
        )

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